var express = require('express');
var mysql = require('mysql');
var fs = require('fs');
var lu_cartype = require('./config/lu_cartype.js');
var md_cartype = require('./config/md_cartype.js');
var multer = require('multer');
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
  	cb(null, 'public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+req.body.md_id+'/');
  },
  filename: function (req, file, cb) {
  	pool.getConnection(function(err, connection){
  		var sql = "SELECT md_thumbnail FROM tb_model WHERE md_id=?";
  		connection.query(sql, [req.body.md_id], function(err, md){
  			var rmpath = 'public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+req.body.md_id+'/'+JSON.parse(JSON.stringify(md[0].md_thumbnail));
  			connection.release();
  			fs.exists(rmpath, function (exists) {
  				if(exists){
  					fs.unlink(rmpath, function (err) {
  						cb(null, 'thumbnail_md_' + req.body.md_id + '_' + file.originalname);
		  			});
  				}else{
  					cb(null, 'thumbnail_md_' + req.body.md_id + '_' + file.originalname);
  				}
  			});
  		});
  	});
  }
});
var upload = multer({ storage: _storage });
//var upload = multer({ dest: 'uploads/' });
var dbconfig = require('./config/database.js');
var pool = mysql.createPool(dbconfig);
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
			var sql = "SELECT * FROM tb_lineup WHERE lu_id=?";
			connection.query(sql, [req.query.lu_id], function(err, lu){
				if(err) console.error(err);
				// var mds = JSON.parse(JSON.stringify(row_mds));

				lu = JSON.parse(JSON.stringify(lu[0]));
				var lu_cart = new Array();

				if(lu.lu_lgt){ lu_cart.push(md_cartype[0]); } if(lu.lu_sml){ lu_cart.push(md_cartype[1]); }
				if(lu.lu_smd){ lu_cart.push(md_cartype[2]); } if(lu.lu_mdm){ lu_cart.push(md_cartype[3]); }
				if(lu.lu_lrg){ lu_cart.push(md_cartype[4]); } if(lu.lu_hcb){ lu_cart.push(md_cartype[5]); }
				if(lu.lu_wgn){ lu_cart.push(md_cartype[6]); } if(lu.lu_suv){ lu_cart.push(md_cartype[7]); }
				if(lu.lu_rvc){ lu_cart.push(md_cartype[8]); } if(lu.lu_van){ lu_cart.push(md_cartype[9]); }
				if(lu.lu_hyb){ lu_cart.push(md_cartype[10]); } if(lu.lu_elc){ lu_cart.push(md_cartype[11]); }
				if(lu.lu_spt){ lu_cart.push(md_cartype[12]); } if(lu.lu_cpe){ lu_cart.push(md_cartype[13]); }
				if(lu.lu_cvt){ lu_cart.push(md_cartype[14]); } if(lu.lu_sup){ lu_cart.push(md_cartype[15]); }
				if(lu.lu_rac){ lu_cart.push(md_cartype[16]); } if(lu.lu_trk){ lu_cart.push(md_cartype[17]); }
				if(lu.lu_bus){ lu_cart.push(md_cartype[18]); } if(lu.lu_cct){ lu_cart.push(md_cartype[19]); }
				if(lu.lu_old){ lu_cart.push(md_cartype[20]); } if(lu.lu_etc){ lu_cart.push(md_cartype[21]); }

				var sql = "SELECT * FROM tb_model WHERE md_lu_id=? ORDER BY md_order ASC";
				connection.query(sql, [lu.lu_id], function(err, mds){
					if(err) console.error(err);
					mds = JSON.parse(JSON.stringify(mds));

					for(var i = 0; i < mds.length; i++){
						var md_cart = [];

						if(mds[i].md_lgt){ md_cart.push(md_cartype[0]); } if(mds[i].md_sml){ md_cart.push(md_cartype[1]); }
						if(mds[i].md_smd){ md_cart.push(md_cartype[2]); } if(mds[i].md_mdm){ md_cart.push(md_cartype[3]); }
						if(mds[i].md_lrg){ md_cart.push(md_cartype[4]); } if(mds[i].md_hcb){ md_cart.push(md_cartype[5]); }
						if(mds[i].md_wgn){ md_cart.push(md_cartype[6]); } if(mds[i].md_suv){ md_cart.push(md_cartype[7]); }
						if(mds[i].md_rvc){ md_cart.push(md_cartype[8]); } if(mds[i].md_van){ md_cart.push(md_cartype[9]); }
						if(mds[i].md_hyb){ md_cart.push(md_cartype[10]); } if(mds[i].md_elc){ md_cart.push(md_cartype[11]); }
						if(mds[i].md_spt){ md_cart.push(md_cartype[12]); } if(mds[i].md_cpe){ md_cart.push(md_cartype[13]); }
						if(mds[i].md_cvt){ md_cart.push(md_cartype[14]); } if(mds[i].md_sup){ md_cart.push(md_cartype[15]); }
						if(mds[i].md_rac){ md_cart.push(md_cartype[16]); } if(mds[i].md_trk){ md_cart.push(md_cartype[17]); }
						if(mds[i].md_bus){ md_cart.push(md_cartype[18]); } if(mds[i].md_cct){ md_cart.push(md_cartype[19]); }
						if(mds[i].md_old){ md_cart.push(md_cartype[20]); } if(mds[i].md_etc){ md_cart.push(md_cartype[21]); }

						mds[i].md_cart = md_cart;
					}

					for(var i = 0; i < mds.length; i++){
						if(mds[i].md_thumbnail == '-'){
							mds[i].md_imgpath = '/images/-/md_thumb.jpg';
						}else{
							mds[i].md_imgpath = "/images/"+req.query.br_id+"/"+lu.lu_id+"/"+mds[i].md_id+"/"+mds[i].md_thumbnail;
						}
					}

					res.render('model', {
						br_id: req.query.br_id,
						br_korName: req.query.br_korName,
						br_engName: req.query.br_engName,
						lu_id: lu.lu_id,
						lu_name: lu.lu_name,
						lu_cart: lu_cart,
						lu_md_count: lu.lu_md_count,
						mds: mds
					});
					connection.release();
				});
			});
		});
	}
});

router.post('/insert', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_lineup SET lu_md_count = lu_md_count + 1 WHERE lu_id=?";
		connection.query(sql, [req.body.lu_id], function(err, rows){

			var cart_md = JSON.parse(req.body.cart);
			var sql = "INSERT INTO tb_model(md_lu_id, md_name, md_thumbnail, md_minyear, md_maxyear, "
			+"md_minprice, md_maxprice, md_pricetype, md_minfuel, md_maxfuel, md_fueltype, md_hp, ";
			var paramSQL = [];
			paramSQL.push(req.body.lu_id);
			paramSQL.push(req.body.md_name);
			paramSQL.push('-');
			paramSQL.push(req.body.md_minyear);
			paramSQL.push(req.body.md_maxyear);
			paramSQL.push(req.body.md_minprice);
			paramSQL.push(req.body.md_maxprice);
			paramSQL.push(req.body.md_pricetype);
			paramSQL.push(req.body.md_minfuel);
			paramSQL.push(req.body.md_maxfuel);
			paramSQL.push(req.body.md_fueltype);
			paramSQL.push(req.body.md_hp);
			for(var i = 0; i < cart_md.length; i++){
				if(i == cart_md.length-1){
					sql += cart_md[i] + ") VALUES(?,?,?,?,?,?,?,?,?,?,?,?,";
					for(var j = 0; j < cart_md.length; j++){
						if(j == cart_md.length-1){
							sql += "?)";
						}else{
							sql += "?,";
						}
						paramSQL.push(1);
					}
				}else{
					sql += cart_md[i]+", ";
				}
			}

			connection.query(sql, paramSQL, function(err, rows){
				if(err) console.error(err);

				fs.mkdir('./public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+rows.insertId, function(err) {
					res.send({rows: true});
					connection.release();
				});
			});
		});
	});
});

router.post('/update', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	var md_cart = JSON.parse(req.body.cart);
	var paramSQL = [];

	paramSQL.push(req.body.md_name);
	paramSQL.push(req.body.md_minyear);
	paramSQL.push(req.body.md_maxyear);
	paramSQL.push(req.body.md_minprice);
	paramSQL.push(req.body.md_maxprice);
	paramSQL.push(req.body.md_pricetype);
	paramSQL.push(req.body.md_minfuel);
	paramSQL.push(req.body.md_maxfuel);
	paramSQL.push(req.body.md_fueltype);
	paramSQL.push(req.body.md_hp);

	for(var i = 0; i < md_cart.length; i++){
		paramSQL.push(md_cart[i]);
	}

	paramSQL.push(req.body.md_id);

	pool.getConnection(function(err, connection){
		var sql = "SELECT * FROM tb_lineup WHERE lu_id=?";
		connection.query(sql, [req.body.lu_id], function(err, lus){
			lus = lus = JSON.parse(JSON.stringify(lus[0]));
			var trueCart = [];

			if(lus.lu_lgt) { trueCart.push('md_lgt'); } if(lus.lu_sml) { trueCart.push('md_sml'); }
			if(lus.lu_smd) { trueCart.push('md_smd'); } if(lus.lu_mdm) { trueCart.push('md_mdm'); }
			if(lus.lu_lrg) { trueCart.push('md_lrg'); } if(lus.lu_hcb) { trueCart.push('md_hcb'); }
			if(lus.lu_wgn) { trueCart.push('md_wgn'); } if(lus.lu_suv) { trueCart.push('md_suv'); }
			if(lus.lu_rvc) { trueCart.push('md_rvc'); } if(lus.lu_van) { trueCart.push('md_van'); }
			if(lus.lu_hyb) { trueCart.push('md_hyb'); } if(lus.lu_elc) { trueCart.push('md_elc'); }
			if(lus.lu_spt) { trueCart.push('md_spt'); } if(lus.lu_cpe) { trueCart.push('md_cpe'); }
			if(lus.lu_cvt) { trueCart.push('md_cvt'); } if(lus.lu_sup) { trueCart.push('md_sup'); }
			if(lus.lu_rac) { trueCart.push('md_rac'); } if(lus.lu_trk) { trueCart.push('md_trk'); }
			if(lus.lu_bus) { trueCart.push('md_bus'); } if(lus.lu_cct) { trueCart.push('md_cct'); }
			if(lus.lu_old) { trueCart.push('md_old'); } if(lus.lu_etc) { trueCart.push('md_etc'); }
		
			var sql = "UPDATE tb_model SET md_name=?, md_minyear=?, "
			+"md_maxyear=?, md_minprice=?, md_maxprice=?, md_pricetype=?, "
			+"md_minfuel=?, md_maxfuel=?, md_fueltype=?, md_hp=?, ";

			for(var i = 0; i < trueCart.length; i++){
				if(i == trueCart.length-1){
					sql += trueCart[i]+"=? ";
				}else{
					sql += trueCart[i]+"=?, ";
				}
			}
			sql += "WHERE md_id=?";
			connection.query(sql, paramSQL, function(err, rows){
				if(err) console.error(err);
				res.send({md: true});
				connection.release();
			});
		});
	});
});

router.post('/delete', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_lineup SET lu_md_count = lu_md_count - 1 WHERE lu_id=?";
		connection.query(sql, [req.body.lu_id], function(err, lu){
			var sql = "DELETE FROM tb_model WHERE md_id=?";
			connection.query(sql, [req.body.md_id], function(err, md){
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
				deleteFolderRecursive('./public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+req.body.md_id);
				res.send({md: true});
				connection.release();
			});
		});
	});
});

router.post('/getmddata', function(req, res, next){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "SELECT * FROM tb_lineup WHERE lu_id=?";
		connection.query(sql, [req.body.lu_id], function(err, lus){
			lus = JSON.parse(JSON.stringify(lus[0]));
			var sql = "SELECT * FROM tb_model WHERE md_id=?";
			connection.query(sql, [req.body.md_id], function(err, mds){
				if(err) console.error(err);
				mds = JSON.parse(JSON.stringify(mds[0]));

				var md_cart = [];
				if(lus.lu_lgt){ md_cart.push({ state: mds.md_lgt, col: md_cartype[0].col }); }
				if(lus.lu_sml){ md_cart.push({ state: mds.md_sml, col: md_cartype[1].col }); }
				if(lus.lu_smd){ md_cart.push({ state: mds.md_smd, col: md_cartype[2].col }); }
				if(lus.lu_mdm){ md_cart.push({ state: mds.md_mdm, col: md_cartype[3].col }); }
				if(lus.lu_lrg){ md_cart.push({ state: mds.md_lrg, col: md_cartype[4].col }); }
				if(lus.lu_hcb){ md_cart.push({ state: mds.md_hcb, col: md_cartype[5].col }); }
				if(lus.lu_wgn){ md_cart.push({ state: mds.md_wgn, col: md_cartype[6].col }); }
				if(lus.lu_suv){ md_cart.push({ state: mds.md_suv, col: md_cartype[7].col }); }
				if(lus.lu_rvc){ md_cart.push({ state: mds.md_rvc, col: md_cartype[8].col }); }
				if(lus.lu_van){ md_cart.push({ state: mds.md_van, col: md_cartype[9].col }); }
				if(lus.lu_hyb){ md_cart.push({ state: mds.md_hyb, col: md_cartype[10].col }); }
				if(lus.lu_elc){ md_cart.push({ state: mds.md_elc, col: md_cartype[11].col }); }
				if(lus.lu_spt){ md_cart.push({ state: mds.md_spt, col: md_cartype[12].col }); }
				if(lus.lu_cpe){ md_cart.push({ state: mds.md_cpe, col: md_cartype[13].col }); }
				if(lus.lu_cvt){ md_cart.push({ state: mds.md_cvt, col: md_cartype[14].col }); } 
				if(lus.lu_sup){ md_cart.push({ state: mds.md_sup, col: md_cartype[15].col }); }
				if(lus.lu_rac){ md_cart.push({ state: mds.md_rac, col: md_cartype[16].col }); }
				if(lus.lu_trk){ md_cart.push({ state: mds.md_trk, col: md_cartype[17].col }); }
				if(lus.lu_bus){ md_cart.push({ state: mds.md_bus, col: md_cartype[18].col }); }
				if(lus.lu_cct){ md_cart.push({ state: mds.md_cct, col: md_cartype[19].col }); }
				if(lus.lu_old){ md_cart.push({ state: mds.md_old, col: md_cartype[20].col }); }
				if(lus.lu_etc){ md_cart.push({ state: mds.md_etc, col: md_cartype[21].col }); }

				mds.md_cart = md_cart;

				res.send(mds);
				connection.release();
			});
		});
	});
});

router.post('/uploadthumbnail', upload.single('user_file'), function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	var md_thumbnail = 'thumbnail_md_' + req.body.md_id + '_' + req.file.originalname;

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_model SET md_thumbnail=? WHERE md_id=?";
		connection.query(sql, [md_thumbnail, req.body.md_id], function(err, rows){
			if(err) console.error(err);
			//console.log("rows : " + JSON.stringify(rows));
			res.send({md: true});
			connection.release();
		});
	});
});

router.post('/order', function(req, res){
	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_model SET md_order=? WHERE md_id=?";
		connection.query(sql, [req.body.md_order, req.body.md_id], function(err, md){
			res.send({md: true});
			connection.release();
		});
	});
});

module.exports = router;