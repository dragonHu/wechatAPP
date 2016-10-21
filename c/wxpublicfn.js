var http = require('http'),
  https = require('https'),
  cache = require('../cache/cache'),
  log = require('../logs/log'),
  cfg = require('../config/config');
//获取tonken
function getAccessTonken(cb) {
  var options = {
    hostname: cfg.wxapipath,
    port: 443,
    path: "/cgi-bin/token?grant_type=client_credential&appid=" + cfg.appid + "&secret=" + cfg.appsecret,
    method: 'GET'
  };
  var req = https.request(options, function(res) {
    var postarr = [];
    res.on('data', function(data) {
      postarr.push(data);
    });
    res.on('end', function() {
      var o = JSON.parse(postarr.toString());
      cache.wxAceessTonken.tonken = o.access_token;
      cache.wxAceessTonken.time = Date.now();
      //打印tonken
      log.printlog('getAccessTonken', o.access_token);
      //执行回调
      if (cb) {
        cb(o.access_token)
      }
    });
  });
  req.end();
  req.on('error', function(e) {
    console.log('request error', e);
  })
}
//获取微信tonken
function getTonken(cb) {
  var cw = cache.wxAceessTonken,
    overtime = 60 * 60 * 1.8 * 1000;
  //tonken有效
  if (cw.tonken !== null && (Date.now() - cw.time) <= overtime) {
    cb(cw.tonken);
  } else {
    getAccessTonken(cb);
  }
}
//获取网页accesstonken
function getNetAccessTonken(code, cb) {
  var options = {
    hostname: cfg.wxapipath,
    port: 443,
    path: "/sns/oauth2/access_token?grant_type=authorization_code&appid=" + cfg.appid + "&secret=" + cfg.appsecret + '&code=' + code,
    method: 'GET'
  };
  var req = https.request(options, function(res) {
    var postarr = [];
    res.on('data', function(data) {
      postarr.push(data);
    });
    res.on('end', function() {
      var o = JSON.parse(postarr.toString());
      //打印tonken
      log.printlog('getNetAccessTonken', o.access_token);
      //执行回调
      if (cb) {
        cb(o)
      }
    });
  });
  req.end();
  req.on('error', function(e) {
    console.log('request error', e);
  });
}

function getNetUserInfo(data, cb) {
  var od = JSON.parse(data.toString()),
    token = od.token,
    openid = od.openid;

  var options = {
    hostname: cfg.wxapipath,
    port: 443,
    path: "/sns/userinfo?access_token=" + token + "&openid=" + openid + "&lang=zh_CN",
    method: 'GET'
  };
  log.printlog('getNetUserInfo', JSON.stringify(options));
  var req = https.request(options, function(res) {
    var postarr = [];
    res.on('data', function(data) {
      postarr.push(data);
    });
    res.on('end', function() {
      //执行回调
      if (cb) {
        cb(postarr.toString())
      }
      //打印tonken
      log.printlog('getNetUserInfo', JSON.stringify(od));
    });
  });
  req.end();
  req.on('error', function(e) {
    log.printlog('request error', e);
  });
}

function getUserInfo(openid,cb) {
  var token = cache.wxAceessTonken.tonken,
    options = {
      hostname: cfg.wxapipath,
      port: 443,
      path: "/cgi-bin/user/info?access_token=" + token + "&openid=" + openid + "&lang=zh_CN",
      method: 'GET'
    };
  
  var req = https.request(options, function(res) {
    var postarr = [];
    res.on('data', function(data) {
      postarr.push(data);
    });
    res.on('end', function() {
      log.printlog('getUserInfo', postarr.toString());
      //执行回调
      if (cb) {
        cb(postarr.toString())
      }
    });
  });
  req.end();
  req.on('error', function(e) {
    log.printlog('request error', e);
  });
}
//获取微信mediaId
function getMediaId(type) {
  //三天
  var overtime = 60 * 60 * 1000 * 24 * 3,
    cw = (type == 'image') ? cache.mediaImgId : cache.mediaVoiceId;
  //id有效
  if (cw.id !== null && (Date.now() - cw.time) <= overtime) {
    return cw.id;
  } else {
    return null;
  }
}
//获取微信mediaid
function getWXMediaId(formdata, type, cb) {
  var tonken = cache.wxAceessTonken.tonken;
  var reqData = formdata;
  //请求参数
  var options = {
    hostname: cfg.wxapipath,
    port: 443,
    path: "/cgi-bin/media/upload?access_token=" + tonken + "&type=" + type,
    method: 'POST',
    headers: {
      "Content-Type": "multipart/form-data",
      "Content-Length": reqData.length,
    }
  };
  var req = https.request(options, function(res) {
    var postarr = [];
    res.on('data', function(data) {
      postarr.push(data);
    });
    res.on('end', function() {

      var o = JSON.parse(postarr.toString());
      //打印tonken
      log.printlog('getWXMediaId', JSON.stringify(o));
      //判断type
      if (type == 'image') {
        cache.mediaImgId.id = o.media_id;
        cache.mediaImgId.time = Date.now();
      } else {
        cache.mediaVoiceId.id = o.media_id;
        cache.mediaVoiceId.time = Date.now();
      }
      //执行回调
      if (cb && o.media_id) {
        cb(o.media_id)
      }
    });
  });
  req.write(reqData);
  req.end();
  req.on('error', function(e) {
    console.log('request error', e);
  });
}
//获取微信相关权限信息
function getJsTicket(callf) {
  var wxsigninfo = cache.wxsigninfo,
    tonken = cache.wxAceessTonken.tonken;
  if (wxsigninfo.ticket.tk && (wxsigninfo.ticket.time - Date.now() <= 7200 * 1000)) {
    // console.log('getJsTicket from cache');
    callf(wxsigninfo.ticket.tk);
  } else {
    var url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + tonken + '&type=jsapi';
    var preq = https.get(url, function(res) {
      var s = '';
      res.on('data', function(d) {
        s += d;
      });
      res.on('end', function() {
        try {
          // console.log('getJsTicket', s);
          var o = JSON.parse(s);
          if (o.errcode === 0) {
            wxsigninfo.ticket.tk = o.ticket;
            log.printlog('getJsTicket', s);
            callf(o.ticket);
          } else {
            console.log('getJsTicket errmsg', s);
          }
        } catch (e) {
          console.log('getJsTicket errmsg:', e, s);
        }
      });
    });
  }
}

//发送微信48小时内的消息
function send48msg(msgdata, cb) {
  var tonken = cache.wxAceessTonken.tonken;
  var options = {
    hostname: cfg.wxapipath,
    port: 443,
    path: "/cgi-bin/message/custom/send?access_token=" + tonken,
    method: 'post'
  };
  var req = https.request(options, function(res) {
    var postarr = [];
    res.on('data', function(data) {
      postarr.push(data);
    });
    res.on('end', function() {
      //执行回调
      if (cb) {
        cb(postarr.toString())
      }
      //打印tonken
      log.printlog('send48msg', msgdata);
    });
  });
  req.end(msgdata.toString());
  req.on('error', function(e) {
    log.printlog('request error', e);
  });
}
//请求菜单
function handlerMenu() {
  var csUrl = cfg.h5url;
  //var openidUrl = cfg.config.h5url + '/v/getOpenid/getOpenid.html';
  var menu = {
    "button": [{
      "name": "今日歌曲",
      "sub_button": [{
        "type": "view",
        "name": "明年今日",
        "url": csUrl + '/v/test.html'
      }, {
        "type": "view",
        "name": "富士山下",
        "url": csUrl + '/v/getOpenid.html?getopenid=1'
      }, {
        "type": "view",
        "name": "不如不见",
        "url": csUrl + "/v/wxjsdkapi.html"
      }, {
        "type": "scancode_waitmsg",
        "name": "扫码带提示",
        "key": "rselfmenu_0_0"
      }, {
        "type": "scancode_push",
        "name": "扫码推事件",
        "key": "rselfmenu_0_1"
      }]
    }, {
      "name": "菜单",
      "sub_button": [{
        "type": "pic_sysphoto",
        "name": "系统拍照",
        "key": "rselfmenu_1_0"
      }, {
        "type": "pic_photo_or_album",
        "name": "相册发图",
        "key": "rselfmenu_1_1"
      }, {
        "type": "pic_weixin",
        "name": "微信相册",
        "key": "rselfmenu_1_2"
      }, {
        "name": "发送位置",
        "type": "location_select",
        "key": "rselfmenu_2_0"
      }, {
        "type": "click",
        "name": "赞一下我们",
        "key": "V1001_GOOD"
      }]
    }, {
      "name": "联系客服",
      "sub_button": [{
        "type": "click",
        "name": "咨询V小仆",
        "key": "V1"
      }, {
        "type": "view",
        "name": "获取openid",
        "url": csUrl + '/v/getOpenid.html?getopenid=1'
      }]
    }]
  };

  getTonken(function(access_token) {
    //获取AccessToken 创建菜单
    createMenu(menu, access_token);
  });
}
//创建菜单
function createMenu(menu, token) {
  var data = new Buffer(JSON.stringify(menu));
  var options = {
    hostname: cfg.wxapipath,
    port: 443,
    path: '/cgi-bin/menu/create?access_token=' + token + '',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  var reqData = https.request(options, function(res) {
    var backMenu = '';
    res.on('data', function(chunk) {
      //获取微信返回的数据
      backMenu += chunk;
    });
    res.on('end', function() {
      //json解析
      //var wr = JSON.parse(backMessage);
      log.printlog('create Menu loading...', backMenu);
    });
  });
  reqData.write(data);
  reqData.end();
  reqData.on('error', function(e) {
    console.log('error:' + e);
  });
}
module.exports = {
  getAccessTonken: getAccessTonken, //获取accesstonken
  getTonken: getTonken, //获取tonken
  getMediaId: getMediaId, //获取素材ID
  getWXMediaId: getWXMediaId,
  send48msg: send48msg, //发送微信48小时客服消息
  handlerMenu: handlerMenu, //处理菜单
  getNetAccessTonken: getNetAccessTonken,
  getNetUserInfo: getNetUserInfo, //获取用户信息
  getUserInfo: getUserInfo,
  getJsTicket: getJsTicket
};