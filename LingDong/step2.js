var _thisStep = {};
(function() {
    'use strict';
    var LD_event_select = $("#LD_event_select"),
        LD_version_select = $("#LD_version_select"),
        LD_searchEvent = $("#LD_searchEvent"),
        LD_eventmpl = $("#LDeventmpl"),
        LD_confirmPush = $("#LD_confirmPush"),
        LD_cancelPush = $("#LD_cancelPush"),
        LD_pushTime = $("#LD_pushTime"),
        LD_event_container = $("#LD_event_container"),
        LD_setEvent = $("#LD_setEvent"),
        LD_urlAddress = $("#LD_urlAddress"),
        LD_Address_container = LD_urlAddress.parent(),
        LD_event_name = $("#LD_event_name"),
        LD_General_urlAddress = $("#LD_General_urlAddress"),
        LD_P_iframe = document.getElementById("LD_P_iframe"),
        LD_name_event_div = $("#LD_name_event_div"),
        LD_event_list = LD_event_select.children('ul'),
        LD_version_list = LD_version_select.children('ul');
    //页面常量
    var event_test_data = [],
        LD_History = [], //历史管理
        tipWebPage = "恢复网页浏览",
        tipSetEvent = "开始设定事件",
        //purl = TDLD.BaseConfig.defaultPath,
        eu = TDLD.EventUtil,
        purl = '',
        urlparam = eu.fnQueryString(document.location.search),
        appID = urlparam.appkey,
        isHasPower = false,
        PathParam = {},
        gData = {},
        gParam = '',
        sdkVersion='', //sdk版本
        event_type = null;
    //load事件 页面初始化时加载
    //LD_P_iframe.attr("src", purl);

    //列表下拉    
    LD_event_select.click(showList);
    LD_version_select.click(showList);
    //事件代理
    LD_event_list.click(selectList);
    LD_version_list.click(selectList);
    //输入事件名称时触发
    LD_searchEvent.keyup(function() {
        //用户输入
        var value = LD_searchEvent.val().trim(),
            temparr = [];
        //如果检索的结果为0则 加载全部数据
        if (value === '') {
            temparr = (event_type == 'edit') ? sqlEventArr(1).concat(sqlEventArr(3)) : event_test_data;
        } else {
            updateArr(value, null, function(arr) {
                temparr = arr;
            }, 'check');
        }
        //先置空
        LD_event_container.html('');
        dotrender(LD_eventmpl, LD_event_container, temparr);
    });
    //点击事件列表时触发
    LD_event_container.click(function(event) {
        //获取当前元素的event
        event = eu.getEvent(event);
        var target = eu.getTarget(event);
        //用户点击的列
        if (target.tagName == 'EM') {
            var className = target.className.trim(),
                parDom = $(target).parents('li'),
                eid = parDom.data('ldid'),
                einput = parDom.find('.event-name input'),
                estrong = parDom.find('.event-name strong'),
                gParam = LD_General_urlAddress.val().trim(),
                event_name = einput.val() || estrong.html();
            if (className === "icon-return") { //撤销
                var param = {
                        "isvalid": 0,
                        "ids": eid,
                        "sdkVersion":sdkVersion,
                        'productid': appID
                    },
                    iurl = TDLD.BaseConfig.itPath + "/valid";
                postInterface(param, iurl, function() {
                    loadpage("true");
                });
            } else if (className === "icon-edit") { //编辑
                einput.focus();
            } else { //删除
                var obj = {},
                    iurl = TDLD.BaseConfig.itPath + "/update";
                obj.productid = appID;
                obj.eventid = eid;
                obj.name = event_name;
                obj.match = encodeURIComponent(gParam);
                obj.state = 3;
                postInterface(obj, iurl, function() {
                    loadpage("true");
                });
            }
        }
    });
    //全部生效
    LD_confirmPush.click(function() {
        if (isHasPower===false) {
            return;
        }
        var ids = sqlEventArr().join(',');
        var param = {
                "isvalid": 1,
                "ids": ids,
                "sdkVersion":sdkVersion,
                'productid': appID
            },
            iurl = TDLD.BaseConfig.itPath + "/valid";
        postInterface(param, iurl, function() {
            loadpage("true");
            $('.tip').html('全部生效成功').fadeIn(300);
            setTimeout(function(){
                $('.tip').fadeOut(300);
            },1500);
        });
    });
    //点击撤销更改
    LD_cancelPush.click(function() {
        if (isHasPower===false) {
            return;
        }
        var ids = sqlEventArr().join(',');
        var param = {
                "isvalid": 0,
                "ids": ids,
                "sdkVersion":sdkVersion,
                'productid': appID
            },
            iurl = TDLD.BaseConfig.itPath + "/valid";
        postInterface(param, iurl, function() {
            loadpage("true");
            $('.tip').html('本次更改已撤销').fadeIn(300);
            setTimeout(function(){
                $('.tip').fadeOut(300);
            },1500);
        });
    });
    //设定事件
    LD_setEvent.click(function(e) {
        //获取当前元素的event
        e = eu.getEvent(e);
        eu.preventDefault(e);
        var LCurl = LD_urlAddress.val().trim();
        if (!isHasPower) {
            fnReset();
            return;
        }
        //传递设定消息
        var pobj = {
            "code": 3,
            "data": {}
        };
        //点击开始设定事件
        if (LD_setEvent.hasClass('can-set')) {
            LD_setEvent.html(tipWebPage);
            LD_setEvent.attr('class', 'reset');
            pobj.data.setEvent = true;
            pobj.data.gData = gData;
        } else {
            LD_setEvent.html(tipSetEvent);
            LD_setEvent.attr('class', 'can-set');
            pobj.data.setEvent = false;
            LD_name_event_div.attr("class", "name-event animated fadeOutDown");
            hideDialog(LD_name_event_div); //隐藏元素
        }
        //发送事件消息
        sendMessage(pobj);
    });
    //事件dialog弹出
    LD_name_event_div.click(function(e) {
        //获取当前元素的event
        e = eu.getEvent(e);
        //阻止冒泡
        eu.stopPropagation(e);
        //阻止默认事件
        eu.preventDefault(e);
        var target = eu.getTarget(e);
        //点击确定
        var pobj = {
            "code": 1,
            "data": {}
        };
        if (target.className == "confirm") {
            var eventName = LD_event_name.val().trim();
            if (eventName === '') {
                LDMsg('事件命不能为空!', 2000);
                return;
            }
            var eventId = LD_event_name.attr('data-id'),
                gParam = LD_General_urlAddress.val().trim(),
                isexist = updateEventName(null, eventName);
            if (isexist) {
                LDMsg('事件命已存在，请重新输入', 2000);
                return;
            }
            pobj.data.eventName = eventName;
            //发送事件消息
            //sendMessage(pobj);
            var iurl = TDLD.BaseConfig.itPath,
                obj = {
                    productid: appID
                };
            if (eventId !== '') {
                iurl = iurl + '/update';
                obj.eventid = eventId;
                obj.name = eventName;
                obj.state = 1;
                obj.match = encodeURIComponent(gParam);
            } else {
                iurl = iurl + '/save';
                obj.name = eventName;
                obj.path = PathParam;
                obj.sdkVersion = sdkVersion;
                var pageurl=replaceUrlQuestion(LD_urlAddress.val());
                obj.page=encodeURIComponent(pageurl);
                obj.match = encodeURIComponent(gParam);
            }
            postEventData(iurl, obj, pobj);
            LD_name_event_div.attr("class", "name-event animated fadeOutDown");
            hideDialog(LD_name_event_div); //隐藏元素
        } else if (target.className == "cancel") {
            LD_name_event_div.attr("class", "name-event animated fadeOutDown");
            hideDialog(LD_name_event_div); //隐藏元素
            //取消事件
            pobj.code = 6;
            pobj.data.isSetEventDone = false;
            //发送事件消息
            sendMessage(pobj);
        } else if (target.className == "findup") {
            pobj.code = 2;
            pobj.data.isSelectUp = true;
            //发送事件消息
            sendMessage(pobj);
        }
    });
    //url输入容器 历史管理
    LD_Address_container.click(function(e) {
        //获取当前元素的event
        e = eu.getEvent(e);
        //阻止冒泡
        eu.stopPropagation(e);
        //阻止默认事件
        eu.preventDefault(e);
        var target = eu.getTarget(e);
        if (target.className == "icon-pre") {
            findRecord("pre");
        } else if (target.className == "icon-next") {
            findRecord("next");
        } else if (target.className == "icon-refresh") {
            purl = LD_urlAddress.val().trim();
            //检验url
            if (/^(http|https)+\:+(\/)/gi.test(purl) == false) {
                LDMsg('输入的网站地址不正确', 2000);
                isHasPower=false;
                fnReset();
                return;
            }
            replaceUrl(purl);
        }
    });
    //enter url
    LD_urlAddress.keyup(function(e) {
        if (e.keyCode === 13) {
            purl = LD_urlAddress.val().trim();
            if (/^(http|https)+\:+(\/)/gi.test(purl) == false) {
                LDMsg('输入的网站地址不正确', 2000);
                isHasPower=false;
                fnReset();
                return;
            }
            replaceUrl(purl);
            replaceHistory(purl);
        }
    });
    //加载url完成
    eu.addHandler(LD_P_iframe, 'load', function(e) {
        //重新设置状态值
        isHasPower=false;
        fnReset();
        gParam = LD_General_urlAddress.val().trim();
        var pobj = {
            "code": 0,
            "data": {
                "appID": appID,
                "purl": purl,
                "urlConfigParam": gParam
            }
        };
        sendMessage(pobj);
    });
    //监听消息
    eu.addHandler(window, 'message', receiveMessage);

    //修改事件名称
    _thisStep.changeEvent = function(thisdom) {
        var _this = $(thisdom);
        var obj = {},
            iurl = TDLD.BaseConfig.itPath + "/update";
        gParam = LD_General_urlAddress.val().trim();
        obj.eventid = _this.data("ldid");
        obj.name = _this.val().trim();
        obj.match = encodeURIComponent(gParam);
        obj.state = 1;
        obj.productid = appID;
        postInterface(obj, iurl, function() {
            loadpage("true");
        });
    };
    //撤销修改
    function postInterface(param, iurl, callback) {
        TDLD.reqAjax(iurl, param, function(data) {
            if (data.code === 200) {
                callback(data);
            }
        }, 'POST');
    }
    /*页面渲染操作*/
    function loadpage(isAddEvent) {
        var iurl = TDLD.BaseConfig.itPath + '/list',
            param = {
                "productid": appID,
                "sdkVersion":sdkVersion,
                "page":encodeURIComponent(replaceUrlQuestion(LD_urlAddress.val()))
            };
        postInterface(param, iurl, function(data) {
            var idata = data,
                lasttime = idata.lastUpdateTime || Date.now();
            var showTime = transTime(lasttime, 'all');
            gData = idata; // 传递给SDK的配置信息
            event_test_data = idata.events;
            //赋值时间
            LD_pushTime.html(showTime);
            //如果是变更状态
            if (event_type == 'edit') {
                dotrender(LD_eventmpl, LD_event_container, sqlEventArr(1).concat(sqlEventArr(3)));
            } else {
                dotrender(LD_eventmpl, LD_event_container, event_test_data);
            }
            if (isAddEvent) {
                var pobj = {
                    "code": 7,
                    "data": {
                        "gData": gData
                    }
                };
                sendMessage(pobj);
            }
        });
    }
    //时间转换
    function transTime(time, type) {
        var d = new Date(parseInt(time)),
            mouth = d.getMonth() + 1,
            day = d.getDate(),
            hour = d.getHours(),
            minute = d.getMinutes(),
            second = d.getSeconds(),
            showTime = '';

        if (minute < 10) {
            minute = "0" + minute;
        }
        if (second < 10) {
            second = "0" + second;
        }
        if (type === "all") {
            showTime = mouth + '月' + day + '日' + ' ' + hour + ':' + minute + ':' + second;
        } else {
            showTime = hour + ':' + minute + ':' + second;
        }
        return showTime;
    }
    //查找历史操作
    function findRecord(opration) {
        purl = LD_urlAddress.val().trim();
        var _index = LD_History.indexOf(purl);
        if (_index === -1) {
            LD_History.push(purl);
            _index = LD_History.indexOf(purl);
        }
        //前进操作 后退操作
        if (opration === "pre") {
            //第一个元素
            if (_index === 0) {
                return;
            }
            var pre = LD_History[_index - 1];
            replaceUrl(pre);
        } else {
            if (_index === LD_History.length - 1) {
                return;
            }
            var next = LD_History[_index + 1];
            replaceUrl(next);
        }
    }
    //替换历史栈
    function replaceHistory(url) {
        var _index = LD_History.indexOf(url);
        if (_index === -1) {
            LD_History.push(url);
        } else {
            //如果已存在 先删除 后加入
            LD_History.splice(_index, 1);
            LD_History.push(url);
        }
    }
    //发送事件数据
    function postEventData(iurl, param, pobj) {
        var isBacklist = "false";
        pobj.code = 6;
        try {
            TDLD.reqAjax(iurl, param, function(data) {
                if (data.code === 200) {
                    LDMsg('提交事件成功!', 2000);
                    pobj.data.isSetEventDone = true;
                    isBacklist = "true";
                } else {
                    LDMsg('提交事件失败!', 2000);
                    pobj.data.isSetEventDone = false;
                }
                sendMessage(pobj);
                //发送事件消息
                loadpage(isBacklist);
            }, 'POST');
        } catch (e) {
            console.log(e.message);
            LDMsg('提交事件失败!请稍后再试', 2000);
        }
    }
    //发送消息
    function sendMessage(pobj) {
        purl =decodeURIComponent(LD_urlAddress.val().trim());
        //purl = TDLD.BaseConfig.defaultPath + '?v=' + Date.now();
        try {
            //使用原生ID查找
            if(LD_P_iframe.contentWindow.postMessage){
                LD_P_iframe.contentWindow.postMessage(JSON.stringify(pobj), purl);
            }else{
                LDMsg('您的应用未嵌入SDK，请嵌入后再试', 2000);
            }
            //window.frames[0].postMessage(JSON.stringify(pobj), purl);
        } catch (e) {
            console.log(e.message);
        }
    }
    //替换url
    function replaceUrl(url){
         LD_urlAddress.val(url);
         LD_General_urlAddress.val(replaceGeneralUrl(url));
         LD_P_iframe.setAttribute("src", url);
    }
    //截取url
     function replaceUrlQuestion(url){
         url=decodeURIComponent(url); 
         var indexQN=url.indexOf('?'),str=url;
         if(indexQN!==-1){
            str=url.substring(0,indexQN);
         }
         return str; 
     }
    //替换通配符
    function replaceGeneralUrl(url){
        url=decodeURIComponent(url);
        var indexQN=url.indexOf('?'),
            indexWN=url.indexOf('#'),str='',isWN='';  //问号 井号
        //替换井号    
        if(indexWN!==-1){
            isWN='#*';
            str=url.substring(0,indexWN-1); 
        }
        str=(str==='')?url:str;
        //替换问号
        if(indexQN!==-1){
           str=str.substring(0,indexQN+1)+'*';   
        }
        str=str+isWN
        return str.trim();
    }
    //隐藏对话框元素
    function hideDialog(dom, time) {
        var hidetime = time || 700;
        setTimeout(function() { dom.hide(); }, hidetime);
    }
    //接收传递的message
    function receiveMessage(e) {
        var jobj = JSON.parse(e.data);
        //如果code等于4 弹出对话框
        if (jobj.code === 4) {
            LD_name_event_div.hide(); //隐藏元素
            var client = jobj.notification.boundClient;
            //重置文本内容
            LD_event_name.val('');
            LD_event_name.attr('data-id', '');
            LD_name_event_div.show().attr("class", "name-event animated fadeInUp");
            LD_event_name.focus();
            //对话框显示的位置
            LD_name_event_div.css("top", client.top);
            LD_name_event_div.css("left", client.left);
            PathParam = jobj.notification.path;
            var eventId = jobj.notification.id;
            updateEventName(eventId);
            //如果父级为body 隐藏查找上一级
            if (PathParam[1].tag == "BODY") {
                LD_name_event_div.find(".findup").hide();
            } else {
                LD_name_event_div.find(".findup").show();
            }
        }
        //code 检查是否有权限
        if (jobj.code === 5) {
            sdkVersion=jobj.notification.sdkVersion;
            console.log(jobj.notification);
            isHasPower = jobj.notification.isSetless;
            //如果校验成功
            if (isHasPower) {
                LD_setEvent.attr('class', 'can-set');
                LD_setEvent.html(tipSetEvent);
                loadpage();
            } else {
                LD_setEvent.attr('class', 'cannot-set');
                LDMsg("您没有改网址的操作权限!", 2000);
            }
        }
        //code为8时url改变
        if (jobj.code === 8) {
            var rurl = decodeURIComponent(jobj.notification.url);
            if (purl.trim() !== rurl.trim()) {
                //地址栏赋值
                LD_urlAddress.val(rurl);
                LD_General_urlAddress.val(replaceGeneralUrl(rurl));
                //不存在则增加到历史
                var _index = LD_History.indexOf(rurl);
                if (_index === -1) {
                    LD_History.push(rurl);
                }
            }
        }
        //code为9时 用户操作SDK
        if (jobj.code === 9) {
            var time = transTime(jobj.notification.time),
                eventName = jobj.notification.eventName;
            LDMsg(eventName + "<br />" + time, 2000);
        }
    }
    //更新赋值event_name
    function updateEventName(eventId, evname) {
        //默认为空数组
        var events = gData.events || [],
            i = events.length,
            isexist = false;
        while (i) {
            i--;
            if (events[i].id == eventId) {
                LD_event_name.val(events[i].name);
                LD_event_name.attr('data-id', events[i].id);
                break;
            } else {
                if (events[i].name == evname) {
                    //evname
                    isexist = true;
                    break;
                }
            }
        }
        return isexist; //返回事件名称是否存在
    }
    //查找数据
    function sqlEventArr(state) {
        var arr = [],
            i = event_test_data.length;
        while (i) {
            i--;
            if (state) { //查找state相等的数据
                if (event_test_data[i].state === state) {
                    arr.push(event_test_data[i]);
                }
            } else { //查询当前数组中的所有事件ID
                arr.push(event_test_data[i].id);
            }
        }
        return arr;
    }
    //修改数据源
    function updateArr(oparam, value, cb, status) {
        var i = event_test_data.length,
            arr = [];
        while (i) {
            i--;
            if (status === 'check') { //检索操作
                if (event_test_data[i].name.indexOf(oparam) >= 0) {
                    arr.push(event_test_data[i]);

                }
            } else if (status === 'edit') {
                if (oparam == event_test_data[i].id) {
                    event_test_data[i].name = value;
                    break;
                }
            } else { //更新操作

            }
        }
        if (cb) { cb(arr); }
    }
    //重置函数
    function fnReset(){
        LD_setEvent.html(tipSetEvent);
        LD_setEvent.attr('class', 'cannot-set');
    }
    //创建一个msg提示
    function LDMsg(msg, time) {
        var $body = $(doc.body);
        if ($body.find('.LD_tip_content_2').length > 0) {
            $('.LD_tip_content_2').html(msg);
        } else {
            var div = "<div class='LD_tip_content_2' style='display:none;'>" + msg + "</div>";
            $(doc.body).append(div);
        }
        $('.LD_tip_content_2').show(100);
        setTimeout(function() {
            $('.LD_tip_content_2').hide(100);
            $(doc.body).remove('.LD_tip_content_2');
        }, time);
    }
    //显示列表
    function showList(e) {
        var _this = $(this);
        if (this.id === "LD_version_select") {
            LD_version_list.toggle(200);
        } else {
            LD_event_list.toggle(200);
        }
    }
    //选择列表
    function selectList(e) {
        //获取当前元素的event
        e = eu.getEvent(e);
        //阻止冒泡
        eu.stopPropagation(e);
        var target = eu.getTarget(e),
            _target = $(target);
        _target.parents('font').children('em').html(target.innerHTML);
        _target.parent().hide();
        var type = _target.data('type');
        event_type = type;
        //根据type值更新数据
        switch (type) {
            case 'edit':
                dotrender(LD_eventmpl, LD_event_container, sqlEventArr(1).concat(sqlEventArr(3)));
                break;
            case 'all':
                dotrender(LD_eventmpl, LD_event_container, event_test_data);
                break;
            case 'own':
                break;
        }
    }
    /**
     * DoT渲染
     * @param tmp模板ID
     * @param sourceDom 插入DOM
     * @param data 数据
     */
    function dotrender(tmp, sourceDom, data) {
        var innerText = doT.template(tmp.html());
        sourceDom.html(innerText(data));
    }
}());

function changeEvent(thisdom) {
    // body...
    _thisStep.changeEvent(thisdom);
}
