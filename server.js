//系统模块
var http = require('http'),
    https = require("https"),
    url = require('url'),
    path = require('path'),
    handleFile = require('./c/handleFile'),
    handleInterface = require('./c/handleInterface'),
    handlewx = require('./c/handlewx'),
    handleEvent = require('./c/handleEvent'),
    log = require('./logs/log'),
    wxfn = require("./c/wxpublicfn"),
    cfg = require('./config/config'),
    chatServer=require('./c/chat_server'),
    //创建http服务
    app = http.createServer(onRequest),
    io = require('socket.io')(app,{ serveClient: false });

//WebSocketServer = require('socket.io')(app);
//处理请求
function onRequest(request, response) {
    var dataArr = [],
        len = 0;
    //log.printlog('request', JSON.stringify(request.headers));    
    //设置请求的数据的编码为utf-8
    //request.setEncoding('utf8');
    request.addListener('data', function(chunk) {
        //push加入
        dataArr.push(chunk);
        len += chunk.length;
    });
    request.addListener('end', function() {
        var pathname = url.parse(request.url).pathname; //把网址交给Url对象处理
        pathname = path.normalize(pathname.replace(/\.\./g, ""));
        //log.printlog(JSON.stringify(request.headers));
        log.printlog("pathname", pathname, request.url, request.method);
        //接受请求的数据
        var reqdata = Buffer.concat(dataArr, len);

        if (request.url.indexOf('signature') >= 0) {
            handlewx.handler(request, response, reqdata);
            return;
        }
        //接口请求
        if (pathname.indexOf('interface') >= 0) {
            //var reqData =Buffer.concat(postData).toString();
            handleInterface.handler(request, response, reqdata);
        } else {
            handleFile.handler(request, response);
        }
    });
}
//全局目录
global.projectDir = __dirname;

function start() {
    app.listen(cfg.h5port);
    log.printlog('h5 server runing at', cfg.h5port);
    //创建微信菜单
    //wxfn.handlerMenu();
    //监听socket链接
    /*io.of('/chat').on('connection', function(socket) {
        log.printlog('socket.io connection');
        handleEvent.handler(socket);
    });
    io.of('/chat').on('close', function() {
        log.printlog('socket.io close');
    });
    io.of('/chat').on('disconnect', function() {
        log.printlog('socket.io disconnect');
    });*/
    //监听socket.io服务 聊天室
    io.on('connection', function(socket) {
        log.printlog('socket.io connection');
        chatServer.listen(socket,io);
    });
    io.on('close', function() {
        log.printlog('socket.io close');
    });
    
}
//启动node服务    
start();