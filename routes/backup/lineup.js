var express = require('express');
var mysql = require('mysql');
var fs = require('fs');
var dbconfig = require('./config/database.js');
var pool = mysql.createPool(dbconfig);
var router = express.Router();

// /admin (return korName, br_id, lu)
router.get('/', function(req, res, next){

	var userInfo = req.session.userInfo;
	var user_id = '';
	try{
		user_id = userInfo.user_id;
	}catch(e){
		console.log('member - session : ' + userInfo);
	}

	if(user_id == ''){
		res.render('login');
	}else{

		var br_id = req.query.br_id;
		var br_korName = req.query.br_korName;
		var br_engName = req.query.br_engName;

		pool.getConnection(function(err, connection){

		    var sql = "SELECT * FROM tb_lineup WHERE lu_br_id=? AND lu_cartype=?";
		    connection.query(sql, [br_id, 1], function(err, cart1){ connection.query(sql, [br_id, 2], function(err, cart2){
		    connection.query(sql, [br_id, 3], function(err, cart3){ connection.query(sql, [br_id, 4], function(err, cart4){
		    connection.query(sql, [br_id, 5], function(err, cart5){ connection.query(sql, [br_id, 6], function(err, cart6){
		    connection.query(sql, [br_id, 7], function(err, cart7){ connection.query(sql, [br_id, 8], function(err, cart8){
		    connection.query(sql, [br_id, 9], function(err, cart9){ connection.query(sql, [br_id, 10], function(err, cart10){
		    connection.query(sql, [br_id, 11], function(err, cart11){ connection.query(sql, [br_id, 12], function(err, cart12){
		    connection.query(sql, [br_id, 13], function(err, cart13){ connection.query(sql, [br_id, 14], function(err, cart14){
		    connection.query(sql, [br_id, 15], function(err, cart15){ connection.query(sql, [br_id, 16], function(err, cart16){
				res.render('lineup', {
					br_engName: br_engName, br_korName: br_korName, br_id: br_id,
					cart1: cart1, cart2: cart2, cart3: cart3, cart4: cart4,
					cart5: cart5, cart6: cart6, cart7: cart7, cart8: cart8,
					cart9: cart9, cart10: cart10, cart11: cart11, cart12: cart12,
					cart13: cart13, cart14: cart14, cart15: cart15, cart16: cart16
				});
				connection.release();
		});});});});});});});});});});});});});});});});});
	}
});

// /admin/insert (insert lineup & return lu)
router.post('/insert', function(req, res, next){
	var br_id = req.body.br_id;
	var lu_name = req.body.lu_name;
	var lu_cartype = req.body.lu_cartype;

	pool.getConnection(function(err, connection){
		var sql = "INSERT INTO tb_lineup(lu_br_id, lu_name, lu_cartype) VALUES(?,?,?)";
		connection.query(sql, [br_id, lu_name, lu_cartype], function(err, rows){
			if(err) console.error(err);
			//console.log("rows : " + JSON.stringify(rows));
			//console.log("lu_id : " + rows.insertId)
			fs.mkdir('./public/images/'+br_id+'/'+lu_cartype+'/'+rows.insertId, function(err) {
				res.send({lu: true});
				connection.release();
			});
		});
	});
});

// /admin/update (update lineup & return lu)
router.post('/update', function(req, res, next){
	var br_id = req.body.br_id;
	var lu_id = req.body.lu_id;
	var lu_name = req.body.lu_name;

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_lineup SET lu_name=? WHERE lu_id="+lu_id;
		connection.query(sql, [lu_name], function(err, rows){
			if(err) console.error(err);
			//console.log("rows : " + JSON.stringify(rows));
			res.send({lu: true});
			connection.release();
		});
	});
});

// /admin/delete (delete lineup & return lu)
router.post('/delete', function(req, res, next){
	var br_id = req.body.br_id;
	var lu_id = req.body.lu_id;
	var cartype = req.body.cartype;

	pool.getConnection(function(err, connection){
		var sql = "DELETE FROM tb_lineup WHERE lu_id=?";
		connection.query(sql, [lu_id], function(err, rows){
			if(err) console.error(err);
			//console.log("rows : " + JSON.stringify(rows));
			
			var deleteFolderRecursive = function(path) {
				if(fs.existsSync(path)){
					fs.readdirSync(path).forEach(function(file,index){
					    var curPath = path + "/" + file;
					    if(fs.lstatSync(curPath).isDirectory()) { // recurse
					      	deleteFolderRecursive(curPath);
					    } else { // delete file
					        fs.unlinkSync(curPath);
					    }
				    });
				    fs.rmdirSync(path);
				}
			};
			deleteFolderRecursive('./public/images/'+br_id+'/'+cartype+'/'+lu_id);
			res.send({lu: true});
			connection.release();
		});
	});
});

router.post('/dir', function(req, res, next) {
	var br_id = req.body.br_id;
	var lu_id = req.body.lu_id;
	var cartype = req.body.cartype;

	fs.mkdir('./public/images/'+br_id+'/'+cartype+'/'+lu_id, function(err) {
		console.log("mkdir : "+'./public/images/'+br_id+'/'+cartype+'/'+lu_id);
		res.send({lu: true});
	});
})

module.exports = router;