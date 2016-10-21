
function fnQueryString(str) {
  str = str.substring(1, str.length);
  var obj = {},
    arr = str.split('&'),
    i = arr.length;
  while (i--) {
    var pm = arr[i].split('=');
    obj[pm[0]] = pm[1];
  }
  return obj;
}
function fnJoinString(obj) {
  var str='?';
  for(var i in obj){
     str+=i+'='+obj[i]+'&';
  }
  return str.substring(0,str.length-1);
}
module.exports ={
 fnQueryString:fnQueryString,
 fnJoinString:fnJoinString
};