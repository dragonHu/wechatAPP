var fs = require('fs')/*,
    log4js = require('log4js')*/;
/*log4js.loadAppender('baev3-log');
var options = {
    'user': 'hunibin16',
    'passwd': 'a128658'
}
log4js.addAppender(log4js.appenders['baev3-log'](options));
var logger = log4js.getLogger('node-log-sdk');*/

function outPrintLog() {
    var buf = new Buffer(handleargs(arguments));
    //打印到控制台
    console.log(buf.toString());
    //logger.info(buf.toString());
    var nowdir = global.projectDir + '/logs/';
    fs.appendFile(nowdir + 'strout.txt', new Date() + '\t' + buf.toString() + '\n', 'utf-8');
}

function outPrintLog2() {
    var buf = new Buffer(handleargs(arguments));
    //打印到控制台
    console.log(buf.toString());
    //logger.info(buf.toString());
    var nowdir = global.projectDir + '/logs/';
    fs.appendFile(nowdir + 'stderr.txt', new Date() + '\t' + buf.toString() + '\n', 'utf-8');
}

function handleargs(arr) {
    var i = 0,
        str = '';
    while (i < arr.length) {
        str += "\t" + arr[i] + "\t";
        i++;
    }
    return str;
}
//抛出日志处理
module.exports = {
    printlog: outPrintLog,
    printerrlog: outPrintLog2
};
