var guestNumber=1,
    nickNames={},
    namesUsed=[],
    roomsarr=[],
    io=null,
    currentRoom={};
//辅助函数
function listen(socket,tio){
   /*io=socketio.listen(server);
   io.set('log level',1);
   //建立连接
   io.sockets.on('connection',function(socket){*/
       io=tio;
       guestNumber=assignGuestName(socket,guestNumber,nickNames,namesUsed); 
       //加入聊天室
       joinRoom(socket,'mrhu');
       //处理用户的消息，更名，以及聊天室的创建和变更
       handleMessageBroadcasting(socket,nickNames);
       handleNameChangeAttempts(socket,nickNames,namesUsed);
       handleRoomJoining(socket);
       //创建房间
       socket.on('rooms',function(){
       	  socket.emit('rooms',roomsarr);
       });
       //断开连接后的逻辑
       handleClientDiscoonection(socket,nickNames,namesUsed);
   //});
}
//分配用户昵称
function assignGuestName(socket,guestNumber,nickNames,namesUsed){
   //生成访客ID	
   var name='Guest'+guestNumber;
   //名称关联客户端ID
   nickNames[socket.id]=name;
   socket.emit('nameResult',{
   	  success:true,
   	  name:name
   });
   namesUsed.push(name); //存放已经被占用的名称
   return guestNumber+1;
}  
//进入聊天室相关逻辑

function joinRoom(socket,room){
   //记录用户当前房间
   socket.join(room);
   currentRoom[socket.id]=room;
   socket.emit('joinResult',{room:room});
   //让房间里的其他用户指定用新用户进入了房间
   socket.broadcast.to(room).emit('message',{
   	text:nickNames[socket.id]+' 进入 '+room+'。'
   });
   //加入房间
   if(roomsarr.indexOf(room)===-1){
      roomsarr.push(room);
   }
   //汇总用户 替换clients函数
   var usersInRoom=io.sockets.adapter.rooms[room];
   //如果不止一个用户在这个房间里 都汇总一下
   if(usersInRoom.length>1){
      var usersInRoomSummary="当前房间"+room+"所有用户"+':';
      for(var index in usersInRoom.sockets){
         var userSocketId=index;
         if(userSocketId!=socket.id){
            usersInRoomSummary+=','+nickNames[userSocketId];
         }
      }
      usersInRoomSummary+='。';
      socket.emit('message',{text:usersInRoomSummary});
   } 
}

//更名请求的处理逻辑
function handleNameChangeAttempts(socket,nickNames,namesUsed){
   //添加name的事件监听器
   socket.on('nameAttempt',function(name){
      if(name.indexOf('Guest')==0){
         socket.emit('nameResult',{
            success:false,
            message:'名称更改不能使用 Guest开头'
         }); 
      }else{
        if(namesUsed.indexOf(name)==-1){
           var previousName=nickNames[socket.id];
           var previousNameIndex=namesUsed.indexOf(previousName);
           namesUsed.push(name);
           nickNames[socket.id]=name;
           delete namesUsed[previousNameIndex];
           socket.emit('nameResult',{
              success:true,
              name:name
           });
           socket.broadcast.to(currentRoom[socket.id]).emit('message',{
            text:previousName+'现在是'+name
           });
        }else{
          socket.emit('nameResult',{
            success:false,
            massage:'这个名称已经被使用'
          });
        }
      }
   });
} 
//处理广播消息
function handleMessageBroadcasting(socket){
   socket.on('message',function(message){
      socket.broadcast.to(message.room).emit('message',{
        text:nickNames[socket.id]+':'+message.text
      });
   });
}
//创建房间 如果房间没有则创建一个房间
function handleRoomJoining(socket){
   socket.on('join',function(room){
      socket.leave(currentRoom[socket.id]);
      joinRoom(socket,room.newRoom);
   });
}
//用户断开连接
function handleClientDiscoonection(socket){
   socket.on('disconnect',function(){
      var nameIndex=namesUsed.indexOf(nickNames[socket.id]);
      socket.broadcast.to(currentRoom[socket.id]).emit('message',{
        text:nickNames[socket.id]+'离开房间'
      });
      delete namesUsed[nameIndex];
      delete nickNames[socket.id];
   });
}
module.exports={
  listen:listen
};
