// 初始化 微信JS-SDK
// WeixinJSBridge ?
(function(){
    "use strict";
	var wxjsapi=[
		'onMenuShareTimeline',
		'onMenuShareAppMessage',
		'hideMenuItems',
		'closeWindow',
		'showMenuItems',
		'scanQRCode',
		'chooseImage',
		'previewImage',
		'uploadImage',
		'downloadImage',
		'startRecord',
		'playVoice',
		'stopRecord',
		'translateVoice',
		'onVoiceRecordEnd',
		'uploadVoice'
	];
	// 从服务器获取 signature
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://'+location.host+'/interface/vxsign', false); // false 同步
	xhr.send(null);
	try{
		var o = JSON.parse(xhr.responseText);
		console.log(xhr.responseText);
		var obj={
			debug:true,
			appId:o.appId,
			timestamp:o.timestamp,
			nonceStr:o.nonceStr,
			signature:o.signature,
			jsApiList:wxjsapi
		};
		console.log(JSON.stringify(obj));

		wx.config(obj);
		wx.error(function (res) {
			alert('error'+res.errMsg);
		});

	}catch(e){
		alert(e);
	}

    function shareFriend(share_img, share_desc, share_title, share_url, callback) {
		//微信分享的数据
		var shareData = {
			title: share_title,
			desc: share_desc,
			link: share_url,
			imgUrl: share_img,
			success: function(res) {
                if(callback !== undefined) callback();
			}
		};

        wx.ready(function() {
		    wx.onMenuShareAppMessage(shareData);
		    wx.onMenuShareTimeline(shareData);
        });
	}

    window.set_wxshare = shareFriend;
})();
