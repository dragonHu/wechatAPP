(function() {
  'use strict';
  var values = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "o", "p", "m", "n", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  var itearations = Math.floor(values.length / 8);
  var leftover = values.length % 8;
  var i = 0;
  var arr = values.concat([]);
  //duff
  for (var i = 26; i >= 0; i--) {
    values = values.concat(arr);
  }
  console.log(Date.now());
  if (leftover > 0) {
    do {
      process(values[i++]);
    } while (--leftover > 0);
  }
  do {
    process(values[i++]);
    process(values[i++]);
    process(values[i++]);
    process(values[i++]);

    process(values[i++]);
    process(values[i++]);
    process(values[i++]);
    process(values[i++]);
  } while (--itearations > 0);
  console.log(Date.now());

  function process(i) {}
  var startTime;
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  startTime = window.mozAnimationStartTime || Date.now();
  //requestAnimationFrame(draw);

  function draw(timestamp) {
    //计算两次重绘时间的间隔 
    var drawStart = (timestamp || Date.now()),
      diff = drawStart - startTime;
    //
    var div = doc.getElementById("mydiv");
    mydiv.style.width = (parseInt(div.style.width, 10) + 5) + '%';
    if (div.style.left != "100%") {
      //把startTime重写为这一次的绘制时间
      startTime = drawStart;
      //console.log(startTime);
      //重绘UI
      requestAnimationFrame(draw);
    }
  }
  //检查是否支持Page Visibility API
  function isHiddenSupported() {
    return typeof(doc.hidden || doc.msHidden || doc.webkitHidded) != 'undefined';
  }
  console.log(isHiddenSupported());

}());
EventUtil.addHandler(doc, 'visibilitychange', handleVisibilityChange);
/*EventUtil.addHandler(doc, 'msvisibilitychange', handleVisibilityChange);
EventUtil.addHandler(doc, 'webkitvisibilitychange', handleVisibilityChange);*/
function handleVisibilityChange() {
  var result = doc.getElementById("result"),
    msg = '';
  if (doc.hidden || doc.msHidden || doc.webkitHidded) {
    msg = "Page is now hiddne." + (new Date()) + "<br />";
  } else {
    msg = "Page is now show." + (new Date()) + "<br />";
  }
  result.innerHTML += msg;
}
//get geolocation
navigator.geolocation.getCurrentPosition(function(position){
    console.log(position);
},function(error){
   console.log('Error code:'+error.code+' message:'+error.message);
},{
  enableHighAccuracy:true,
  timeout:5000,
  maximunAge:25000
});