var url = require('url'),
    fs = require('fs'),
    path = require('path'),
    mime = require('../config/mime'),
    cfg = require('../config/config'),
    log = require('../logs/log'),
    utilfn = require("./utilfn"),
    wxfn = require("./wxpublicfn"),
    NOWDIR = __dirname + '/../';

function handler(req, res) {
    var urlparam = url.parse(req.url),
        //把网址交给Url对象处理
        pathname = urlparam.pathname,
        ext = path.extname(pathname), //获取后缀名
        search = urlparam.search;

    if (ext == '.html' && search && search.indexOf('getopenid') !== -1) {
        var pm = utilfn.fnQueryString(search);
        if (pm.code) {
            //console.log(surl);
            wxfn.getNetAccessTonken(pm.code, function(o) {
                //删除对象属性  
                delete pm.code;
                delete pm.state;
                delete pm.getopenid;
                pm.openid = o.openid;
                pm.token = o.access_token;
                //重新获取参数
                var rsearch = utilfn.fnJoinString(pm),
                    surl = cfg.h5url + pathname + rsearch;
                log.printlog('h5 file path:', JSON.stringify(o), pathname, surl);
                res.writeHead(302, {
                    'location': surl
                });
                res.end();
            });
        } else {
            //不弹授权页  只拿用户信息 snsapi_base  
            var surl = cfg.h5url + urlparam.href,
                rurl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + cfg.appid + '&redirect_uri=' + encodeURIComponent(surl) + '&response_type=code&scope=snsapi_userinfo#wechat_redirect';
            res.writeHead(302, {
                'location': rurl
            });
            res.end();
        }
        return;
    }
    // body...
    if (pathname === "\\" || pathname === '/') {
        //如果是根目录就设置为默认首页
        pathname = cfg.index;
    }
    //文件路径
    var filepath = path.join(NOWDIR + pathname);
    log.printlog('h5 file path:', filepath, req.url);
    readFileShow(res, filepath);
}

//读取文件并显示
function readFileShow(res, filepath, code) {
    var ext = path.extname(filepath);
    try {
        var filedata = fs.readFileSync(filepath);
        ext = ext ? ext.slice(1) : 'unknown';
        //判断文本类型 默认为二进制
        var ct = mime[ext] || 'application/octet-stream';
        res.writeHead(code || 200, {
            'Content-Type': ct
        });
        res.write(filedata);
        res.end();
    } catch (e) {
        if (ext == '.html' || ext == '.htm') {
            handlerError(404, 'page not found', e, res);
        } else {
            //设置头部文件信息
            res.writeHead(404, {
                'Content-Type': mime[ext]
            }); 
            res.end();
        }
        log.printerrlog('readFileShow:', e.message);
    }

}
//处理错误页面
function handlerError(code, title, error, res) {
    var filedata = fs.readFileSync(global.projectDir + cfg.errorpage);
    console.log('handlerError',global.projectDir + cfg.errorpage);
    //错误信息
    //filedata=filedata.replace(/<%=([\s\S]+?)%>/gm,e+'<br>'+__filename);
    filedata = filedata.toString().replace(/<%=error%>/gm, error + '<br> at:' + __filename).replace(/<%=title%>/gm, code + ':' + title);
    //用内置fs对象读取文件
    res.writeHead(code, {
        'Content-Type': 'text/html'
    }); //设置头部文件信息
    //将读取的内容输出给客户端
    res.write(filedata);
    res.end();
}
//解析头部报文
var mimeType = function(req) {
    var str = req.headers['content-type'] || '';
    return str.split(';')[0];
};

//抛出处理模块
module.exports = {
    handler: handler
};