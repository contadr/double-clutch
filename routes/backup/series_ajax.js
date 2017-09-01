var express = require('express');
var mysql = require('mysql');
var dbconfig = require('./config/database.js');
var pool = mysql.createPool(dbconfig);
var router = express.Router();

// /admin (return korName, br_id, sr)
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
			//console.log("sr_br_id : " + sr_br_id);
		    var sql = "SELECT * FROM tb_series WHERE sr_br_id="+br_id;
		    connection.query(sql, function(err, row_sr){
		      if(err) console.error(err);
		      //console.log("sr : " + JSON.stringify(sr));

		      res.render('series', {br_engName: br_engName, br_korName: br_korName, br_id: br_id, sr: row_sr});
		      connection.release();
		    });
		});
	}
});

// /admin/insert (insert series & return sr)
router.post('/insert', function(req, res, next){
	var br_id = req.body.br_id;
	var sr_name = req.body.sr_name;

	pool.getConnection(function(err, connection){
		var sql = "INSERT INTO tb_series(sr_br_id, sr_name) VALUES(?,?)";
		connection.query(sql, [br_id, sr_name], function(err, rows){
			if(err) console.error(err);
			//console.log("rows : " + JSON.stringify(rows));

			var sql = "SELECT * FROM tb_series WHERE sr_br_id="+br_id;
			connection.query(sql, function(err, row_sr){
		      	if(err) console.error(err);
		      	//console.log("sr : " + JSON.stringify(sr));

		      	res.send({sr: row_sr});
		      	connection.release();
		    });
		});
	});
});

// /admin/update (update series & return sr)
router.post('/update', function(req, res, next){
	var br_id = req.body.br_id;
	var sr_id = req.body.sr_id;
	var sr_name = req.body.sr_name;

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_series SET sr_name=? WHERE sr_id="+sr_id;
		connection.query(sql, [sr_name], function(err, rows){
			if(err) console.error(err);
			//console.log("rows : " + JSON.stringify(rows));
			var sql = "SELECT * FROM tb_series WHERE sr_br_id="+br_id;
			connection.query(sql, function(err, row_sr){
				if(err) console.error(err);
				//console.log("sr : " + JSON.stringify(sr));
				res.send({sr: row_sr});
				connection.release();
			});
		});
	});
});

// /admin/delete (delete series & return sr)
router.post('/delete', function(req, res, next){
	var br_id = req.body.br_id;
	var sr_id = req.body.sr_id;

	pool.getConnection(function(err, connection){
		var sql = "DELETE FROM tb_series WHERE sr_id=?";
		connection.query(sql, [sr_id], function(err, rows){
			if(err) console.error(err);
			//console.log("rows : " + JSON.stringify(rows));
			var sql = "SELECT * FROM tb_series WHERE sr_br_id="+br_id;
			connection.query(sql, function(err, row_sr){
				if(err) console.error(err);
				//console.log("sr : " + JSON.stringify(sr));
				res.send({sr: row_sr});
				connection.release();
			});
		});
	});
});

module.exports = router;