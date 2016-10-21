(function() {
    'use strict';
    var scanqr = document.getElementById('scanqr'),
        writeQR = document.getElementById("writeQR"),
        chooseimg = document.getElementById("chooseimg"),
        showimage = document.getElementById("showimage"),
        upload = document.getElementById("upload"),
        errmsg = document.getElementById("errmsg"),
        sendmsg = document.getElementById('sendmsg'),
        userid = document.getElementById('userid'),
        checkinter = document.getElementById("checkinter");

    var localimgIds, media_id;

    scanqr.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        wx.scanQRCode({
            needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
            scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
            success: function(res) {
                var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                writeQR.textContent = result;
            }
        });
    }, false);

    checkinter.addEventListener('click', function(e) {
        wx.checkJsApi({
            jsApiList: ['chooseImage', 'scanQRCode', 'uploadImage'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
            success: function(res) {
                // 以键值对的形式返回，可用的api值true，不可用为false
                // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
                var rc = res.checkResult;
                alert('chooseImage:' + rc.chooseImage + ' scanQRCode: ' + rc.scanQRCode + ' uploadImage:' + rc.uploadImage);
            }
        });
    });

    chooseimg.addEventListener('click', function(e) {
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['compressed'],
            sourceType: ['album'],
            success: function(res) {
                localimgIds = res.localIds.toString(); // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                showimage.src = localimgIds;
                //setTimeout(uploadImages,100);
            },
            fail: function(err) {
                for (var i in err) {
                    alert(i + ' : ' + err[i]);
                }
            }
        });
        //alert('choose');
    });

    function uploadImages() {
        wx.uploadImage({
            localId: localimgIds, // 需要上传的图片的本地ID，由chooseImage接口获得
            isShowProgressTips: 1, // 默认为1，显示进度提示
            success: function(res) {
                media_id = res.serverId.toString(); // 返回图片的服务器端ID
                alert('上传完成',media_id);
            }
        });
    }
    upload.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadImages();
    });

    sendmsg.addEventListener('click', function(e) {
        var openid = userid.value.toString().trim();
        var obj = {
            "touser": openid,
            "msgtype": 'image',
            'image':{
                "media_id": media_id
            }
        };
        postAjax('/interface/sendwxmsg', obj,function(data){
           alert(data);
        });
    });

    function postAjax(url, data,cb, ContentType, option) {
        var param = {
            url: url,
            data: data,
            type: 'post',
            ContentType: ContentType || 'application/json',
            success: function(data) {
                if(cb)cb(data);
            }
        };
        //增加解析头部
        if (option === 'processData') {
            param[option] = false;
        }
        AJAX.ajaxReq(param);
    }
}());