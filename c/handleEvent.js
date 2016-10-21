var log = require('../logs/log'),
    cache = require('../cache/cache'),
	wxfn = require("./wxpublicfn");

var temp_sk = null;

function handler(socket) {
	temp_sk = socket;
	temp_sk.on('dispatch', function(data) {
		var obj = {
			"touser": data.openid.trim(),
			"msgtype": "text",
			"text":{
				"content": data.msg
			}
		};
		wxfn.send48msg(JSON.stringify(obj));
		log.printlog('dispatch', data.msg);
	});
	temp_sk.on('disconnect2', function(data) {
		var openid=data.openid.trim();
		var obj = {
			"touser":openid ,
			"msgtype": "text",
			"text":{
				"content": '欢迎下次光临!'
			}
		};
		delete cache.wxCustomMsg[openid];
		wxfn.send48msg(JSON.stringify(obj));
		log.printlog('disconnect', data.msg);
	});
}

function backmsg() {
	temp_sk.emit('news', {
		msg: Date.now()
	});
	//temp_sk.sendUTF(Date.now().toString());
}

function custommsg(data, tip) {
	log.printlog('custommsg', data);
	temp_sk.emit('news', {
		userinfo: data,
		msg: tip
	});
}
module.exports = {
	handler: handler,
	custommsg: custommsg
};