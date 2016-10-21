var url = require("url"),
  cfg = require('../config/config'),
  crypto = require('crypto'),
  log = require('../logs/log'),
  xml2js = require('xml2js'),
  wxfn = require("./wxpublicfn"),
  handleEvent = require("./handleEvent"),
  utilfn = require("./utilfn"),
  cache = require('../cache/cache'),
  fs = require('fs');

function handler(req, res, data) {
  var urlpama = url.parse(req.url).search;
  urlpama = utilfn.fnQueryString(urlpama);
  var isvild = checkivild(urlpama.nonce, urlpama.timestamp, urlpama.signature);
  var reqData = data.toString();
  //如果来自微信
  if (isvild) {
    log.printlog("weChat sucess!");
    var wxsigninfo = cache.wxsigninfo;
    wxsigninfo.nonce = urlpama.nonce;
    wxsigninfo.timestamp = urlpama.timestamp;
    wxsigninfo.signature = urlpama.signature;

    switch (req.method.toLocaleLowerCase()) {
      case 'get':
        res.writeHead(200, {
          "Content-Type": "text/plain"
        });
        res.end('ok');
        break;
      case 'post':
        handlerWXmessage(reqData, res);
        break;
    }
  }
}


//检查微信签名是否有效
function checkivild(nonce, timestamp, signature) {
  var shasum = crypto.createHash('sha1'),
    arr = [cfg.Token, timestamp, nonce].sort(),
    $str = arr.join('');
  shasum.update($str);
  var $tmpstr = shasum.digest('hex');
  if ($tmpstr == signature) {
    return true;
  } else {
    return false;
  }
}
//被动处理微信消息
function handlerWXmessage(data, res) {
  var obj = parsetoJSON(data).xml;
  log.printlog('handlerWXmessage', JSON.stringify(data));
  switch (obj.MsgType) {
    case 'text': //文本消息
      handlerWXText(obj, res);
      break;
    case 'event':
      handlerWXEvent(obj, res);
      break;
  }
}
//处理文本消息
function handlerWXText(obj, res) {
  var userid = obj.ToUserName,
    openid = obj.FromUserName,
    MsgType = obj.MsgType,
    str = "hello world",
    content = obj.Content,
    objxml = {
      xml: {
        ToUserName: openid,
        FromUserName: userid,
        MsgType: MsgType,
        CreateTime: Date.now()
      }
    };
  switch (content) {
    case 'image':
      backsendmedia(content, objxml, 'Image', res);
      break;
    case 'voice':
      backsendmedia(content, objxml, 'Voice', res);
      break;
    default:
      log.printlog('getcacheuserinfo', cache.wxCustomMsg[openid]);
      //如果是客服消息
      if (cache.wxCustomMsg[openid]!==undefined) {
        
        handleEvent.custommsg(cache.wxCustomMsg[openid],content);
        res.end();
      } else {
        objxml.xml.Content = str;
        backhmsg(objxml, res);
      }
      break;
  }
}

//处理微信事件
function handlerWXEvent(obj, res) {
  var eventName = obj.Event,
    userid = obj.ToUserName,
    openid = obj.FromUserName,
    EventKey = obj.EventKey,
    objxml = {
      xml: {
        ToUserName: openid,
        FromUserName: userid,
        CreateTime: Date.now()
      }
    };
  log.printlog('handlerWXEvent', JSON.stringify(obj));
  switch (eventName) {
    case 'subscribe':
      var oxml = objxml.xml;
      oxml.MsgType = 'news';
      oxml.ArticleCount = 1;
      oxml.Articles = {
        item: {
          Title: '红包来了',
          Description: 'TD红包',
          PicUrl: cfg.bagurl,
          Url: cfg.h5url
        }
      };
      log.printlog('subscribe', JSON.stringify(objxml));
      backhmsg(objxml, res);
      break;
    case 'unsubscribe':
      log.printlog('unsubscribe', openid);
      break;
    case 'CLICK':
      //处理点击事件
      if (EventKey == 'V1') {
        objxml.xml.Content = '有什么可以帮您？';
        objxml.xml.MsgType="text";
        cache.wxCustomMsg[openid]="true";
        wxfn.getUserInfo(openid, function(data) {
             cache.wxCustomMsg[openid]=data; 
             log.printlog('cacheuserinfo', cache.wxCustomMsg[openid]); 
        });
        backhmsg(objxml, res);

      }
      break;
  }
}
//发送媒体消息
function backsendmedia(content, objxml, type, res) {
  var mediaid = wxfn.getMediaId(content);
  //打印mediaID
  log.printlog('mediaid', mediaid);
  objxml.xml[type] = {};
  objxml.xml[type].MediaId = mediaid;
  objxml.xml.MsgType = content;
  backhmsg(objxml, res);
}
//被动回复消息
function backhmsg(obj, res) {
  var builder = new xml2js.Builder({
      xmldec: {},
      headless: true,
      cdata: true
    }),
    xml = builder.buildObject(obj);
  //打印日志
  log.printlog("answer msg!", xml);
  res.writeHead(200, {
    'Content-Type': 'text/xml'
  });
  res.write(xml);
  res.end();
}
//xml解析
function parsetoJSON(xml) {
  var obj = {},
    parser = new xml2js.Parser({
      explicitArray: false
    });
  parser.parseString(xml, function(err, result) {
    if (err) {
      log.printerrlog('parsetoJSON', err);
    }
    obj = result;
  });
  return obj;
}
module.exports = {
  handler: handler
};