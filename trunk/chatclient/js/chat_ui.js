function divEscapedContentElment(message){
   return '<div>'+message+'</div>';
}

function divSystemContentElement(message){
	return '<div><i>'+message+'</i></div>';
}
function processUserInput(chatApp,socket){
	var message=$('#send-message').val().trim().replace(/[&\|\\\*^%$#\-]/g,""),
	    $messages=$('#messages'), 
	    systemMessage;
	if(message.charAt(0)=='@'){
       systemMessage=chatApp.processCommand(message);
       if(systemMessage){
          $messages.append(divSystemContentElement(systemMessage)); 
       }
	}else{
		chatApp.sendMessage($('#room').text(),message);
		$messages.append(divEscapedContentElment(message));
		$messages.scrollTop($messages.prop('scrollHeight'));
	}
	$('#send-message').val('');    
}