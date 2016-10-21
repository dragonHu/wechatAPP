var path = require('path'),
	mime = require('../config/mime'),
	cfg = require('../config/config'),
	wxfn = require("./wxpublicfn"),
	url = require('url'),
	crypto = require('crypto'),
	dns = require('dns'),
	log = require('../logs/log')/*,
	users = require('../m/users')*/;

function handler(req, res, data) {
	var method = req.method.toLocaleLowerCase(); //把网址交给Url对象处理
	var pathname = url.parse(req.url).pathname;
	log.printlog('handler', pathname, method);
	switch (method) {
		case 'get':
			if (pathname.indexOf('accesstoken') !== -1) {
				wxfn.getTonken(function(tonken) {
					res.writeHead(200, {
						'Content-Type': 'text/plain'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(tonken);
					res.end();
				});
			}
			if (pathname.indexOf('vxsign') !== -1) {
				//校验参数
				var urlhref = req.headers.referer,
					noncestr = createNonceStr(),
					timestamp = createTimestamp();
				wxfn.getJsTicket(function(tk) {
					var shasum = crypto.createHash('sha1'),
						arr = ["jsapi_ticket=" + tk, "noncestr=" + noncestr, "timestamp=" + timestamp, "url=" + urlhref],
						$str = arr.join('&');
					shasum.update($str);
					var $tmpstr = shasum.digest('hex');
					var obj = {
						appId: cfg.appid,
						nonceStr: noncestr,
						timestamp: timestamp,
						signature: $tmpstr
					};
					log.printlog('vxsign', JSON.stringify(obj), tk, $str);
					res.writeHead(200, {
						'Content-Type': 'json/application'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(JSON.stringify(obj));
					res.end();
				});
			}
			break;
		case 'post':
			//var _index=pathname.indexOf('uploadmedia');
			if (pathname.indexOf('uploadmedia') !== -1) {
				var _index = pathname.indexOf('uploadmedia');
				var type = pathname.substr(_index, pathname.length).split('/')[1];
				//打印上传类型
				log.printlog('handler type', type);

				wxfn.getWXMediaId(data, type, function(mediaid) {
					res.writeHead(200, {
						'Content-Type': 'text/plain'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(mediaid);
					res.end();
				});
			} else if (pathname.indexOf('sendwxmsg') !== -1) {
				wxfn.send48msg(data, function(data) {
					res.writeHead(200, {
						'Content-Type': 'text/plain'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(data);
					res.end();
				});
			} else if (pathname.indexOf('getUserInfo') !== -1) {
				wxfn.getNetUserInfo(data, function(data) {
					res.writeHead(200, {
						'Content-Type': 'json/application'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(data);
					res.end();
				});
			} else if (pathname.indexOf('getip4') !== -1) {
				var o = JSON.parse(data.toString());

				dns.lookup(o.hostname, function(err, addresses, family) {
					log.printlog('dns.lookup', err, addresses, family);
					var obj = {
						"addresses": addresses || ''
					};
					//校验参数
					res.writeHead(200, {
						'Content-Type': 'json/application'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(JSON.stringify(obj));
					res.end();
				});
			} else if (pathname.indexOf('mginsert') !== -1) {
				var o = JSON.parse(data.toString());
				users.insert(o, function(resdata) {
					//校验参数
					res.writeHead(200, {
						'Content-Type': 'json/application'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(JSON.stringify({
						'code': 200,
						"data": resdata
					}));
					res.end();
				});

			} else if (pathname.indexOf('mgquery') !== -1) {
				var o = (data) ? JSON.parse(data.toString()) : null;
				users.query(o, function(resdata) {
					//校验参数
					res.writeHead(200, {
						'Content-Type': 'json/application'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(JSON.stringify({
						'code': 200,
						data: resdata
					}));
					res.end();
				});
			} else if (pathname.indexOf('mgupdate') !== -1) {
				var o = JSON.parse(data.toString());
				users.update(o.reqdata, function(resdata) {
					//校验参数
					res.writeHead(200, {
						'Content-Type': 'json/application'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(JSON.stringify({
						'code': 200,
						data: resdata
					}));
					res.end();
				});
			} else if (pathname.indexOf('mgdelete') !== -1) {
				var o = JSON.parse(data.toString());
				users.delete(o, function(resdata) {
					//校验参数
					res.writeHead(200, {
						'Content-Type': 'json/application'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(JSON.stringify({
						'code': 200,
						data: resdata
					}));
					res.end();
				});
			} else if (pathname.indexOf('mgcount') !== -1) {
				users.count(function(resdata) {
					//校验参数
					res.writeHead(200, {
						'Content-Type': 'json/application'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(JSON.stringify({
						'code': 200,
						data: resdata
					}));
					res.end();
				});
			} else if (pathname.indexOf('mggettable') !== -1) {
				users.gettable(function(resdata) {
					//校验参数
					res.writeHead(200, {
						'Content-Type': 'json/application'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(JSON.stringify({
						'code': 200,
						"data": resdata
					}));
					res.end();
				});
			} else if (pathname.indexOf('mgnewtable') !== -1) {
				var o = JSON.parse(data.toString());
				users.newtable(o.tablename);
				//校验参数
				res.writeHead(200, {
					'Content-Type': 'json/application'
				}); //设置头部文件信息
				//将读取的内容输出给客户端
				res.write(JSON.stringify({
					'code': 200
				}));
				res.end();
			} else if (pathname.indexOf('mgdroptable') !== -1) {
				var o = JSON.parse(data.toString());
				users.droptable(o.tablename, function() {
					//校验参数
					res.writeHead(200, {
						'Content-Type': 'json/application'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(JSON.stringify({
						'code': 200
					}));
					res.end();
				});

			} else if (pathname.indexOf('mgdropdb') !== -1) { //删除数据库
				users.deleteDB(function() {
					//校验参数
					res.writeHead(200, {
						'Content-Type': 'json/application'
					}); //设置头部文件信息
					//将读取的内容输出给客户端
					res.write(JSON.stringify({
						'code': 200
					}));
					res.end();
				});

			} else if (pathname.indexOf('mgnewdb') !== -1) { //新建数据库
				var o = JSON.parse(data.toString());
				users.newdb(o.dbname);
				//校验参数
				res.writeHead(200, {
					'Content-Type': 'json/application'
				}); //设置头部文件信息
				//将读取的内容输出给客户端
				res.write(JSON.stringify({
					'code': 200
				}));
				res.end();
			} else if (pathname.indexOf('mgdisconnect') !== -1) {
				users.disconnect();
				//校验参数
				res.writeHead(200, {
					'Content-Type': 'json/application'
				}); //设置头部文件信息
				//将读取的内容输出给客户端
				res.write(JSON.stringify({
					'code': 200
				}));
				res.end();
			} else {
				//校验参数
				res.writeHead(200, {
					'Content-Type': 'json/application'
				}); //设置头部文件信息
				//将读取的内容输出给客户端
				res.write(JSON.stringify({
					'code': 401,
					"msg": "this user none promise!"
				}));
				res.end();
			}
			break;
	}
}

function createNonceStr() {
	return Math.random().toString(36).substr(2, 15);
}

function createTimestamp() {
	return parseInt(Date.now() / 1000);
}
//抛出处理模块
module.exports = {
	handler: handler
};