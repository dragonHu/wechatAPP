(function() {
	//'use strict';
	//在线状态
	var status = doc.getElementById("status");
	EventUtil.attachEvent(window, "online", function() {
		status.innerHTML = "online";
	});
	//离线状态
	EventUtil.attachEvent(window, "offline", function() {
		status.innerHTML = "offline";
	});
	//cookie
	//var name = "hunibin";
	//doc.cookie="name="+encodeURIComponent(name)+";domain=172.30.117.145:18081;path=/";
	var CookieUtil = {
		cookie: doc.cookie,
		get: function(name) {
			var lcookie = this.cookie,
				cookieName = encodeURIComponent(name) + "=",
				cookieStart = lcookie.indexOf(cookieName),
				cookieValue = null;
			console.log(cookieStart, cookieName, lcookie);
			if (cookieStart > -1) {
				var cookieEnd = lcookie.indexOf(';', cookieStart);
				if (cookieEnd == -1) {
					cookieEnd = lcookie.length;
				}
				cookieValue = decodeURIComponent(lcookie.substring(cookieStart + cookieName.length, cookieEnd));
			}
			return cookieValue;
		},
		set: function(name, value, expiredays, path, domain, secure) {
			var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
			if (typeof expiredays == 'number') {
				var exdate = new Date();
				exdate.setDate(exdate.getDate() + expiredays);
				cookieText += ";expires=" + exdate.toGMTString();
			}
			if (path) {
				cookieText += ";path=" + path;
			}
			if (domain) {
				cookieText += ";domain=" + domain;
			}
			if (secure) {
				cookieText += ";secure=" + secure;
			}
			console.log(cookieText);
			doc.cookie = cookieText;
			console.log(doc.cookie);
		},
		unset: function(name, path, domain, secure) {
			this.set(name, '', -1, path, domain, secure);
		}
	};
	//设置cookie
	CookieUtil.set("whatname", "hunibin", 365, '/', location.host, false);
	//获取cookie
	console.log(CookieUtil.get("whatname"));
	CookieUtil.unset("whatname",'/', location.host, false);
	console.log('unset',CookieUtil.get("whatname"));
	//设置子cookie的方式
	var SubCookieUtil = {
		cookie: doc.cookie,
		get: function(name, subName) {
			var subCookies = this.getAll(name);
			if (subCookies) {
				return subCookies[subName];
			} else {
				return null;
			}
		},
		getAll: function(name) {
			var lcookie = this.cookie,
				cookieName = encodeURIComponent(name) + "=",
				cookieStart = lcookie.indexOf(cookieName),
				cookieEnd,
				subCookies,
				i,len=0, parts, result = {},
				cookieValue = null;
			if (cookieStart > -1) {
				cookieEnd = lcookie.indexOf(';', cookieStart);
				if (cookieEnd == -1) {
					cookieEnd = lcookie.length;
				}
				cookieValue = lcookie.substring(cookieStart + cookieName.length, cookieEnd);
				if (cookieValue.length > 0) {
					subCookies = cookieValue.split("&");
					for (i = 0, len = subCookies.length; i < len; i++) {
						parts = subCookies[i].split("=");
						result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
					}
					return result;
				}
			}
			return null;
		},
		set: function(name,subName, value, expiredays, path, domain, secure) {
			var subCookies = this.getAll(name) || {};
			subCookies[subName] = value;
			this.setAll(name, subCookies, expiredays, path, domain, secure);
		},
		setAll: function(name, subCookies, expiredays, path, domain, secure) {
			var cookieText = encodeURIComponent(name) + "=",
				subcookieParts = [],
				subName;
			for (subName in subCookies) {
				if (subName.length > 0 && subCookies.hasOwnProperty(subName)) {
					subcookieParts.push(encodeURIComponent(subName) + "=" + encodeURIComponent(subCookies[subName]));
				}
			}
			if (subcookieParts.length > 0) {
				cookieText += subcookieParts.join("&");
				if (typeof expiredays == 'number') {
					var exdate = new Date();
					exdate.setDate(exdate.getDate() + expiredays);
					cookieText += ";expires=" + exdate.toGMTString();
				}
				if (path) {
					cookieText += ";path=" + path;
				}
				if (domain) {
					cookieText += ";domain=" + domain;
				}
				if (secure) {
					cookieText += ";secure=" + secure;
				}
			} else {
				var exdate = new Date();
				cookieText += ";expires=" + exdate.toGMTString();
			}
			doc.cookie = cookieText;
		},
		//这里省略了更多的代码
		unset:function(name,subName,path,domain,secure){
           var subCookies=this.getAll(name);
           if(subCookies){
           	  delete subCookies[subName];
           	  this.setAll(name,subName,null,path,domain,secure);
           }
		},
		unsetAll:function(name,path,domain,secure){
            this.setAll(name,null,-1,path,domain,secure);
		}
	};
	//设置两个cookie
	SubCookieUtil.set("data","wname","hunibin",365);
	SubCookieUtil.set("data","music","逍遥游",365);
	var data=SubCookieUtil.getAll('data');
	console.log('data',data);
	SubCookieUtil.unsetAll('data');
	console.log('unsetAll data',data);

}());