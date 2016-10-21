var mongodb = require("mongodb").MongoClient,
	log = require('../logs/log'),
	DB_Connent_Address = 'mongodb://127.0.0.1:27017/',
	defualtDB='mrhu',
	_thisDB = null,
	collection = null; //本地27017端口
start();	
function start(dbname) {
	defualtDB=(dbname)?dbname:defualtDB;
	//打开数据库
	mongodb.connect(DB_Connent_Address+defualtDB, function(err, db) {
		if (err) {
			log.printlog('connect', err);
			return;
		}
		log.printlog('connent mongodb success!');
		_thisDB = db;
	});
}
function insertTable(obj, cb) {
	collection.insert(obj, function(err, result) {
		if (err) {
			log.printlog('insertTable', err);
			return;
		}
		if (cb) cb(result);
		log.printlog('insertTable', JSON.stringify(result));
	});
}

function queryTable(obj, cb) {
	//条件查询
	if (obj) {
		collection.find(obj).toArray(function(err, result) {
			if (err) {
				log.printlog('queryTable', err);
				return;
			}
			console.log(result);
			if (cb) cb(result);
			log.printlog('queryTable');
		});
	} else {
		collection.find().toArray(function(err, result) {
			if (err) {
				log.printlog('queryTableALL', err);
				return;
			}
			console.log(result);
			if (cb) cb(result);
			log.printlog('queryTableALL');
		});
	}

}

function updateTable(arr, cb) {
	//条件更新 第一个为要更新的ID 第二个为更新的条件 upsert操作 没有就增加
	collection.update(arr[0], arr[1], true, function(err, result) {
		if (err) {
			log.printlog('updateTable', err);
			return;
		}
		console.log(result);
		if (cb) cb(result);
		log.printlog('updateTable');
	});
}

function deleteTable(obj, cb) {
	//条件更新 第一个为要更新的ID 第二个为更新的条件 upsert操作 没有就增加
	collection.remove(obj, function(err, result) {
		if (err) {
			log.printlog('deleteTable', err);
			return;
		}
		console.log(result);
		if (cb) cb(result);
		log.printlog('deleteTable');
	});
}
//计算条数
function countTable(cb) {
	collection.count(function(err, result) {
		if (err) {
			log.printlog('countTable', err);
			return;
		}
		if (cb) cb(result);
		log.printlog('countTable');
	});
}

//获取当前数据库下的所有表名
function gettableName(cb) {
	_thisDB.collections(function(err, result) {
		if (err) {
			log.printlog('countTable', err);
			return;
		}
		var i = 0,
			obj = {};
		while (i < result.length) {
			var rss = result[i].s;
			if (!obj[rss.dbName]) {
				obj[rss.dbName] = [];
				obj[rss.dbName].push(rss.name);
			} else {
				obj[rss.dbName].push(rss.name);
			}
			i++;
		}
		if (cb) cb(obj);
		log.printlog('countTable');
	});
}
//切换打开表
function newtable(tablename) {
	//连接表
	collection = _thisDB.collection(tablename);
}
//删除表
function droptable(tablename, cb) {
	//console.log(_thisDB);
	//_thisDB[tablename].drop();
	_thisDB.dropCollection(tablename, function() {
		if (cb) cb();
	});
}
//删除数据库
function deleteDB(cb) {
	//console.log(_thisDB);
	//_thisDB[tablename].drop();
	_thisDB.dropDatabase(function() {
		if (cb) cb();
	});
}

function disconnect() {
	_thisDB.close();
}
module.exports = {
	"insert": insertTable,
	"query": queryTable,
	"update": updateTable,
	"delete": deleteTable,
	"count": countTable,
	"gettable": gettableName,
	"newtable": newtable,
	"droptable": droptable,
	"deleteDB": deleteDB,
	"disconnect": disconnect,
	"newdb": start
};