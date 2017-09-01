var express = require('express');
var mysql = require('mysql');
var fs = require('fs');
var multer = require('multer');
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/'+req.body.br_id+'/'+req.body.cartypeid+'/'+req.body.lu_id+'/'+req.body.md_id+'/');
  },
  filename: function (req, file, cb) {
    cb(null, 'thumbnail_' + file.originalname);
  }
});
var upload = multer({ storage: _storage });
var dbconfig = require('./config/database.js');
var pool = mysql.createPool(dbconfig);
var router = express.Router();

// /admin (return korName, br_id, lu)
router.get('/', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	var br_id = req.query.br_id;
	var br_korName = req.query.br_korName;
	var br_engName = req.query.br_engName;
	var lu_id = req.query.lu_id;
	var lu_name = req.query.lu_name;
	var cartype = req.query.cartype;
	var cartypeid = req.query.cartypeid;
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
		pool.getConnection(function(err, connection){
			var sql = "SELECT * FROM tb_model WHERE md_lu_id=?";
			connection.query(sql, [lu_id], function(err, mds){
				if(err) console.error(err);
				// var mds = JSON.parse(JSON.stringify(row_mds));
				// console.log(mds.length);
				for(var i = 0; i < mds.length; i++){
					if(mds[i].md_thumbnail == '-'){
						mds[i].md_imgpath = '/images/-/md_thumb.jpg';
					}else{
						mds[i].md_imgpath = "/images/"+br_id+"/"+cartypeid+"/"+lu_id+"/"+mds[i].md_id+"/"+mds[i].md_thumbnail;
					}
				}
				res.render('model', {
					br_id: br_id,
					br_korName: br_korName,
					br_engName: br_engName,
					lu_id: lu_id,
					lu_name: lu_name,
					cartype: cartype,
					cartypeid: cartypeid,
					mds: mds
				});
				connection.release();
			});
		});
	}
});

router.post('/insert', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	var br_id = req.body.br_id;
	var lu_id = req.body.lu_id;
	var cartypeid = req.body.cartypeid;

	// lu_id
	var md_name = req.body.md_name;
	var md_minprice = req.body.md_minprice;
	var md_maxprice = req.body.md_maxprice;
	var md_pricetype = req.body.md_pricetype;
	var md_minfuel = req.body.md_minfuel;
	var md_maxfuel = req.body.md_maxfuel;
	var md_hp = req.body.md_hp;

	pool.getConnection(function(err, connection){
		var sql = "INSERT INTO tb_model(md_lu_id, md_name, md_thumbnail, md_minprice, md_maxprice, md_minfuel, md_maxfuel, md_hp, md_pricetype) VALUES(?,?,?,?,?,?,?,?,?)";
		connection.query(sql, [lu_id, md_name, '-', md_minprice, md_maxprice, md_minfuel, md_maxfuel, md_hp, md_pricetype], function(err, rows){
			if(err) console.error(err);
			//console.log("rows : " + JSON.stringify(rows));

			fs.mkdir('./public/images/'+br_id+'/'+cartypeid+'/'+lu_id+'/'+rows.insertId, function(err) {
				res.send({md: true});
				connection.release();
			});
		});
	});

});

router.post('/uploadimage', upload.single('user_file'), function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	var md_id = req.body.md_id;
	var br_id = req.body.br_id;
	var lu_id = req.body.lu_id;
	var cartypeid = req.body.cartypeid;

	var md_thumbnail = 'thumbnail_' + req.file.originalname;

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_model SET md_thumbnail=? WHERE md_id=?";
		connection.query(sql, [md_thumbnail, md_id], function(err, rows){
			if(err) console.error(err);
			//console.log("rows : " + JSON.stringify(rows));
			res.send({md: true});
			connection.release();
		});
	});
});

router.post('/update', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	var md_id = req.body.md_id;
	var br_id = req.body.br_id;
	var lu_id = req.body.lu_id;
	var cartypeid = req.body.cartypeid;

	var md_name = req.body.md_name;
	var md_minprice = req.body.md_minprice;
	var md_maxprice = req.body.md_maxprice;
	var md_pricetype = req.body.md_pricetype;
	var md_minfuel = req.body.md_minfuel;
	var md_maxfuel = req.body.md_maxfuel;
	var md_hp = req.body.md_hp;

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_model SET md_name=?, md_minprice=?, md_maxprice=?, md_minfuel=?, md_maxfuel=?, md_hp=?, md_pricetype=? WHERE md_id=?";
		connection.query(sql, [md_name, md_minprice, md_maxprice, md_minfuel, md_maxfuel, md_hp, md_pricetype, md_id], function(err, rows){
			if(err) console.error(err);
			//console.log("rows : " + JSON.stringify(rows));
			res.send({md: true});
			connection.release();
		});
	});
});

router.post('/dialogupdate', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	var md_id = req.body.md_id;
	pool.getConnection(function(err, connection){
		var sql = "SELECT * FROM tb_model WHERE md_id=?";
		connection.query(sql, [md_id], function(err, md){
			if(err) console.error(err);
			res.send(md[0]);
			connection.release();
		});
	});
});

router.post('/delete', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);
	
	var br_id = req.body.br_id;
	var lu_id = req.body.lu_id;
	var md_id = req.body.md_id;
	var cartypeid = req.body.cartypeid;

	pool.getConnection(function(err, connection){
		var sql = "DELETE FROM tb_model WHERE md_id=?";
		connection.query(sql, [md_id], function(err, rows){
			if(err) console.error(err);

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
			deleteFolderRecursive('./public/images/'+br_id+'/'+cartypeid+'/'+lu_id+'/'+md_id);
			res.send({md: true});
			connection.release();
		});
	});
});

module.exports = router;