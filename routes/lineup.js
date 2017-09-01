var express = require('express');
var mysql = require('mysql');
var fs = require('fs');
var dbconfig = require('./config/database.js');
var pool = mysql.createPool(dbconfig);
var multer = require('multer');
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
  	cb(null, 'public/images/'+req.body.br_id+'/'+req.body.lu_id+'/');
  },
  filename: function (req, file, cb) {
  	pool.getConnection(function(err, connection){

  		var sql = "SELECT lu_thumbnail FROM tb_lineup WHERE lu_id=?";
  		connection.query(sql, [req.body.lu_id], function(err, lu){
  			lu = JSON.parse(JSON.stringify(lu[0]));

  			var rmpath = 'public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+lu.lu_thumbnail;
  			connection.release();
  			fs.exists(rmpath, function (exists) {
  				if(exists){
  					fs.unlink(rmpath, function (err) {
  						cb(null, 'lu_thumbnail_' + req.body.lu_id + '_' + file.originalname);
		  			});
  				}else{
  					cb(null, 'lu_thumbnail_' + req.body.lu_id + '_' + file.originalname);
  				}
  			});
  		});
  	});
  }
});
var upload = multer({ storage: _storage });
var router = express.Router();

// /admin (return korName, br_id, lu)
router.get('/', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	var userInfo = req.session.userInfo;
	var user_id = '';
	try{
		user_id = userInfo.user_id;
	}catch(e){
		console.log('member - session : ' + userInfo);
	}

	if(user_id == ''){
		res.render('auth');
	}else{

		pool.getConnection(function(err, connection){
			var sql = "SELECT br_lu_count FROM tb_brand WHERE br_id=?";
			connection.query(sql, [req.query.br_id], function(err, br){
				var sql = "SELECT * FROM tb_lineup WHERE lu_br_id=? ORDER BY lu_order ASC";
				connection.query(sql, [req.query.br_id], function(err, lus){
					var sql = "SELECT * FROM tb_brand_cartype WHERE bc_br_id=?";
					connection.query(sql, [req.query.br_id], function(err, bcs){
						if(err) console.error(err);

						res.render('lineup', {
							br_id: req.query.br_id,
							br_korName: req.query.br_korName,
							br_engName: req.query.br_engName,
							br_lu_count: JSON.parse((JSON.stringify(br[0].br_lu_count))),
							lus: lus,
							brand_cartype: bcs
						});
						connection.release();
					});
				});
			});
		});
	}
});

// /admin/insert (insert lineup & return lu)
router.post('/insert', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_brand SET br_lu_count=br_lu_count+1 WHERE br_id=?";
		connection.query(sql, [req.body.br_id], function(err, br){
			var sql = "INSERT INTO tb_lineup(lu_br_id, lu_name) VALUES(?,?)";
			connection.query(sql, [req.body.br_id, req.body.lu_name], function(err, lu){
				if(err) console.error(err);
				fs.mkdir('./public/images/'+req.body.br_id+'/'+lu.insertId, function(err) {
					res.send({lu: true});
					connection.release();
				});
			});
		});
	});
});

// /lineup/update (update lineup & return lu)
router.post('/update', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_lineup SET lu_name=? WHERE lu_id=?";
		connection.query(sql, [req.body.lu_name, req.body.lu_id], function(err, lu){
			res.send({lu: true});
			connection.release();
		});
	});
});

// /admin/delete (delete lineup & return lu)
router.post('/delete', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
			var sql = "UPDATE tb_brand SET br_lu_count = br_lu_count - 1 WHERE br_id=?";
			connection.query(sql, [req.body.br_id], function(err, br){
				var sql = "DELETE FROM tb_lineup WHERE lu_id=?";
				connection.query(sql, [req.body.lu_id], function(err, lu){
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
					deleteFolderRecursive('./public/images/'+req.body.br_id+'/'+req.body.lu_id);
					res.send({lu: true});
					connection.release();
				});
			});
	});
});

router.post('/getludata', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "SELECT * FROM tb_lineup WHERE lu_id=?";
		connection.query(sql, [req.body.lu_id], function(err, lu){
			if(err) console.error(err);

			res.send(lu[0]);
			connection.release();
		});
	});
});

router.post('/getluimgdata', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "SELECT lu_thumbnail FROM tb_lineup WHERE lu_id=?";
		connection.query(sql, [req.body.lu_id], function(err, lu){
			lu = JSON.parse(JSON.stringify(lu[0]));
			var imagepath = null;

			if(!lu.lu_thumbnail){
				imagepath = '/images/-/md_thumb.jpg';
			}else{
				imagepath = '/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+lu.lu_thumbnail;
			}

			res.send({path: imagepath});
			connection.release();
		});
	})
});

router.post('/order', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_lineup SET lu_order=? WHERE lu_id=?";
		connection.query(sql, [req.body.lu_order, req.body.lu_id], function(err, lu){
			res.send({lu: true});
			connection.release();
		});
	});
});

router.post('/insertbc', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "INSERT INTO tb_brand_cartype(bc_br_id, bc_name) VALUES(?,?)";
		connection.query(sql, [req.body.br_id, req.body.bc_name], function(err, bc){
			res.send({bc: true});
			connection.release();
		});
	});
});
router.post('/updatebc', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_brand_cartype SET bc_name=? WHERE bc_id=?";
		connection.query(sql, [req.body.bc_name, req.body.bc_id], function(err, bc){
			res.send({bc: true});
			connection.release();
		});
	});
});
router.post('/deletebc', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "DELETE FROM tb_brand_cartype WHERE bc_id=?";
		connection.query(sql, [req.body.bc_id], function(err, bc){
			res.send({bc: true});
			connection.release();
		});
	});
});

router.post('/uploadimage', upload.single('upload_image'), function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	var imageName = 'lu_thumbnail_' + req.body.lu_id + '_' + req.file.originalname;
	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_lineup SET lu_thumbnail=? WHERE lu_id=?";
		connection.query(sql, [imageName, req.body.lu_id], function(err, lu){
			if(err) console.error(err);

			res.send({lu: true});
			connection.release();
		});
	});
});

router.post('/getgndata', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "SELECT * FROM tb_generation WHERE gn_lu_id=? ORDER BY gn_order ASC";
		connection.query(sql, [req.body.lu_id], function(err, gns){
			res.send({gns: gns});
			connection.release();
		});
	});
});

router.post('/gninsert', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_lineup SET lu_gn_count = lu_gn_count + 1 WHERE lu_id=?";
		connection.query(sql, [req.body.lu_id], function(err, lu){
			var sql = "INSERT INTO tb_generation(gn_br_id, gn_lu_id, gn_name, gn_order) VALUES(?,?,?,?)";
			connection.query(sql, [req.body.br_id, req.body.lu_id, req.body.gn_name, req.body.gn_order], function(err, gn){
				fs.mkdir('./public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+gn.insertId, function(err) {
					fs.mkdir('./public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+gn.insertId+'/gallery', function(err){});
					res.send({gn: true});
					connection.release();
				});
			});
		});
	});
});

router.post('/gnupdate', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_generation SET gn_order=?, gn_name=? WHERE gn_id=?";
		connection.query(sql, [req.body.gn_order, req.body.gn_name, req.body.gn_id], function(err, gn){
			res.send({gn: true});
			connection.release();
		});
	});
});

router.post('/gndelete', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_lineup SET lu_gn_count = lu_gn_count - 1 WHERE lu_id=?";
		connection.query(sql, [req.body.lu_id], function(err, lu){
			var sql = "DELETE FROM tb_generation WHERE gn_id=?";
			connection.query(sql, [req.body.gn_id], function(err, gn){

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
				deleteFolderRecursive('./public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+req.body.gn_id);

				res.send({gn: true});
				connection.release();
			});
		});
	});
});

module.exports = router;