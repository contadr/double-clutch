var express = require('express');
var mysql = require('mysql');
var dbconfig = require('./config/database.js');
var pool = mysql.createPool(dbconfig);
var fs = require('fs');
var multer = require('multer');
var storage_thumb = multer.diskStorage({
  destination: function (req, file, cb) {
  	cb(null, 'public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+req.body.gn_id+'/');
  },
  filename: function (req, file, cb) {
  	pool.getConnection(function(err, connection){

  		var thumb = "";
  		if(req.body.thumb == 1){
  			thumb = "gn_thumbnail1";
  		}else if(req.body.thumb = 2){
  			thumb = "gn_thumbnail2";
  		}

  		var sql = "SELECT "+thumb+" FROM tb_generation WHERE gn_id=?";
  		connection.query(sql, [req.body.gn_id], function(err, gn){
  			gn = JSON.parse(JSON.stringify(gn[0]));

  			var rmpath = 'public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+req.body.gn_id+'/';
  			if(req.body.thumb == 1){
	  			rmpath += gn.gn_thumbnail1;
	  		}else if(req.body.thumb = 2){
	  			rmpath += gn.gn_thumbnail2;
	  		}
  			connection.release();
  			fs.exists(rmpath, function (exists) {
  				if(exists){
  					fs.unlink(rmpath, function (err) {
  						cb(null, thumb + '_' + req.body.gn_id + '_' + file.originalname);
		  			});
  				}else{
  					cb(null, thumb + '_' + req.body.gn_id + '_' + file.originalname);
  				}
  			});
  		});
  	});
  }
});

var storage_gall = multer.diskStorage({
  destination: function (req, file, cb) {
  	cb(null, 'public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+req.body.gn_id+'/gallery/');
  },
  filename: function (req, file, cb) {
  	pool.getConnection(function(err, connection){
  		var sql = "INSERT INTO tb_gn_gallery(gngal_gn_id, gngal_bc_id, gngal_image) VALUES(?,?,?)";
  		connection.query(sql, [req.body.gn_id, req.body.bc_id, file.originalname], function(err, gngal){

  			var imageName = "gngal_"+gngal.insertId+"_"+req.body.bc_id+"_"+file.originalname
  			var sql = "UPDATE tb_gn_gallery SET gngal_image=? WHERE gngal_id=?";
  			connection.query(sql, [imageName, gngal.insertId], function(err, rows){
  				cb(null, imageName);
  				connection.release();
  			});
  		});
  	});
  }
});

var storage_gall_up = multer.diskStorage({
  destination: function (req, file, cb) {
  	cb(null, 'public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+req.body.gn_id+'/gallery/');
  },
  filename: function (req, file, cb) {
  	pool.getConnection(function(err, connection){
  		var imageName = "gngal_"+req.body.gngal_id+"_"+req.body.bc_id+"_"+file.originalname;

  		var sql = "UPDATE tb_gn_gallery SET gngal_image=? WHERE gngal_id=?";
  		connection.query(sql, [imageName, req.body.gngal_id], function(err, gngal){

  			var rmpath = 'public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+req.body.gn_id+'/gallery/'+req.body.gngal_image;
  			fs.exists(rmpath, function (exists) {
  				if(exists){
  					fs.unlink(rmpath, function (err) {
  						cb(null, imageName);
		  			});
  				}else{
  					cb(null, imageName);
  				}
  			});
		});
  	});
  }
});

var upload_thumb = multer({ storage: storage_thumb });
var upload_gall = multer({ storage: storage_gall });
var upload_gall_up = multer({ storage: storage_gall_up });

var YouTube = require('youtube-node');

var fueltype = require('./config/fueltype.js');

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
				lu = JSON.parse(JSON.stringify(lu[0]));
				var sql = "SELECT * FROM tb_generation WHERE gn_id=?";
				connection.query(sql, [req.query.gn_id], function(err, gn){
					gn = JSON.parse(JSON.stringify(gn[0]));

					var thumbnailCheck = function(path){
						var retpath = null;
						if(!path){
							retpath = '/images/-/md_thumb.jpg';
						}else{
							retpath = '/images/'+req.query.br_id+'/'+req.query.lu_id+'/'+req.query.gn_id+'/'+path;
						}

						return retpath;
					};

					gn.gn_thumbnail1 = thumbnailCheck(gn.gn_thumbnail1);
					gn.gn_thumbnail2 = thumbnailCheck(gn.gn_thumbnail2);

					var sql = "SELECT * FROM tb_brand_cartype WHERE bc_br_id=?";
					connection.query(sql, [req.query.br_id], function(err, bcs){
						bcs = JSON.parse(JSON.stringify(bcs));
						
						var sql = "SELECT * FROM tb_gn_gallery WHERE gngal_gn_id=?";
						connection.query(sql, [req.query.gn_id], function(err, gngal){
							gngal = JSON.parse(JSON.stringify(gngal));

							var sql = "SELECT * FROM tb_gn_video WHERE gnvid_gn_id=? ORDER BY gnvid_order ASC";
							connection.query(sql, [req.query.gn_id], function(err, gnvid){
								gnvid = JSON.parse(JSON.stringify(gnvid));

								if(gn.gn_bc){
									var splitbc = (gn.gn_bc).split(',');
									var sql_bc = "";

									for(var i = 0; i < splitbc.length; i++){
										sql_bc += "SELECT * FROM tb_brand_cartype WHERE bc_br_id="+req.query.br_id+" AND bc_id="+splitbc[i]+";";
									}
									connection.query(sql_bc, function(err, gnbcs){
										gnbcs = JSON.parse(JSON.stringify(gnbcs));

										var resbcs = [];
										if(gnbcs.length > 1){
											for(i = 0; i < gnbcs.length; i++){
												resbcs.push(gnbcs[i][0]);
											}
										}else{
											resbcs.push(gnbcs[0]);
										}

										res.render('generation', {
											br_id: req.query.br_id,
											br_korName: req.query.br_korName,
											br_engName: req.query.br_engName,
											lu: lu,
											gn: gn,
											bcs: bcs,
											gnbcs: resbcs,
											gngal: gngal,
											gnvid: gnvid,
											active: req.query.active,
											ft: fueltype
										});
										connection.release();
									});
								}else{
									var gnbcs = [
										{
											bc_id: 0,
											bc_name: ''
										}
									];
									res.render('generation', {
										br_id: req.query.br_id,
										br_korName: req.query.br_korName,
										br_engName: req.query.br_engName,
										lu: lu,
										gn: gn,
										bcs: bcs,
										gnbcs: gnbcs,
										gngal: gngal,
										gnvid: gnvid,
										active: req.query.active,
										ft: fueltype
									});
									connection.release();
								}
							});
						});
					});
				});
			});
		});
	}
});

router.post('/updateinfo', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){

		var brand_cartypeT = JSON.parse(req.body.brand_cartypeT);
		var brand_cartypeF = JSON.parse(req.body.brand_cartypeF);
		var paramSQL = [];

		var checkChilds = function(bc){
			var breakCount = 0;
			for(var i = 0; i < brand_cartypeF.length; i++){
				if(brand_cartypeF[i] == bc){
					breakCount ++;
				}
			}
			return breakCount;
		};

		var sql = "SELECT gngal_bc_id FROM tb_gn_gallery WHERE gngal_gn_id=?";
		connection.query(sql, [req.body.gn_id], function(err, gals){
			gals = JSON.parse(JSON.stringify(gals));
			var sql = "SELECT md_bc_id FROM tb_model WHERE md_gn_id=?";
			connection.query(sql, [req.body.gn_id], function(err, mds){
				mds = JSON.parse(JSON.stringify(mds));

				var breakCount = 0;

				for(var i = 0; i < gals.length; i++){
					breakCount += checkChilds(gals[i].gngal_bc_id);
				}
				for(var i = 0; i < mds.length; i++){
					breakCount += checkChilds(mds[i].md_bc_id);
				}

				if(breakCount != 0){
					res.send({gn: false});
					connection.release();
				}else{
					paramSQL.push(req.body.gn_name);
					paramSQL.push(req.body.gn_minyear);
					var sql = "UPDATE tb_generation SET gn_name=?, gn_minyear=?, ";
					if(req.body.gn_maxyear == 0){
						paramSQL.push(null);
					}else{
						paramSQL.push(req.body.gn_maxyear);
					}
					var insertBC = "";
					for(var i = 0; i < brand_cartypeT.length; i++){
						if(i == brand_cartypeT.length-1){
							insertBC += brand_cartypeT[i];
						}else{
							insertBC += brand_cartypeT[i]+",";
						}
					}
					paramSQL.push(insertBC);
					paramSQL.push(req.body.gn_market);
					paramSQL.push(req.body.gn_history);
					paramSQL.push(req.body.gn_id);
					sql += "gn_maxyear=?, gn_bc=?, gn_market=?, gn_history=? WHERE gn_id=?";

					connection.query(sql, paramSQL, function(err, gn){
						res.send({gn: true});
						connection.release();
					});
				}
			});
		});
	});
});

// 썸네일 이미지 등록
router.post('/updatethumb', upload_thumb.single("upload_thumb"), function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	var thumb = "";
	if(req.body.thumb == 1){
		thumb = "gn_thumbnail1";
	}else if(req.body.thumb = 2){
		thumb = "gn_thumbnail2";
	}

	var imageName = thumb + '_' + req.body.gn_id + '_' + req.file.originalname;
	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_generation SET "+thumb+"=? WHERE gn_id=?";
		connection.query(sql, [imageName, req.body.gn_id], function(err, gn){
			if(err) console.error(err);

			res.send({gn: true});
			connection.release();
		});
	});
});

router.post('/getgallerydata', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "SELECT * FROM tb_gn_gallery WHERE gngal_gn_id=? AND gngal_bc_id=?";
		connection.query(sql, [req.body.gn_id, req.body.bc_id], function(err, gngals){
			
			res.send({gngals: gngals});
			connection.release();
		});
	});
});

// tb_gn_gallery 이미지 insert / upload_gall.single() file을 받아옴
router.post('/uploadinsertgallery', upload_gall.array("upload_gallery"), function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	res.send({gngal: true});
});

// tb_gn_gallery 이미지 update / upload_gall_up.single() file을 받아옴
router.post('/uploadupdategallery', upload_gall_up.single("upload_gallery"), function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	res.send({gngal: true});
});

// tb_gn_gallery 이미지 delete / 이미지 경로 삭제
router.post('/deletegallery', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "DELETE FROM tb_gn_gallery WHERE gngal_id=?";
		connection.query(sql, [req.body.gngal_id], function(err, gngal){

			var rmpath = 'public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+req.body.gn_id+'/gallery/'+req.body.gngal_image;
			connection.release();
			fs.exists(rmpath, function (exists) {
				if(exists){
					fs.unlink(rmpath, function (err) {});
				}
				res.send({gngal: true});
			});
		});
	});
});

router.post('/deleteallgallery', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "SELECT * FROM tb_gn_gallery WHERE gngal_gn_id=? AND gngal_bc_id=?";
		connection.query(sql, [req.body.gn_id, req.body.bc_id], function(err, gngals){
			gngals = JSON.parse(JSON.stringify(gngals));
			var rmimageName = [];

			for(var i = 0; i < gngals.length; i++){

				var rmpath = 'public/images/'+req.body.br_id+'/'+req.body.lu_id+'/'+req.body.gn_id+'/gallery/';
				rmpath += gngals[i].gngal_image;
				fs.unlink(rmpath, function (err) {});
			}

			var sql = "DELETE FROM tb_gn_gallery WHERE gngal_gn_id=? AND gngal_bc_id=?";
			connection.query(sql, [req.body.gn_id, req.body.bc_id], function(err, gngal){
				res.send({gngal: true});
				connection.release();
			});
		});
	});
});

router.post('/insertvideo', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	var youTube = new YouTube();
	youTube.setKey('AIzaSyDdRCQ74Ewx1Jeg6KRlybAdB2nCA2qAvPA');

	youTube.getById(req.body.gnvid_videokey, function(error, result) {
	  if (error) { console.log(error); res.send({gnvid: false}); }
	  else {
	  	if(result.items.length == 0){
	  		res.send({gnvid: false});
	  	}else{
	  		pool.getConnection(function(err, connection){
				var sql = "INSERT INTO tb_gn_video(gnvid_gn_id, gnvid_videokey, gnvid_order) VALUES(?,?,?)";
				connection.query(sql, [req.body.gn_id, req.body.gnvid_videokey, req.body.gnvid_order], function(err, gnvid){
					res.send({gnvid: true});
					connection.release();
				});
			});
	  	}
	  }
	});
});

router.post('/updatevideo', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	var youTube = new YouTube();
	youTube.setKey('AIzaSyDdRCQ74Ewx1Jeg6KRlybAdB2nCA2qAvPA');

	youTube.getById(req.body.gnvid_videokey, function(error, result) {
		 if (error) { console.log(error); res.send({gnvid: false}); }
		 else {
		 	if(result.items.length == 0){
	  		res.send({gnvid: false});
	  		}else{
	  			pool.getConnection(function(err, connection){
					var sql = "UPDATE tb_gn_video SET gnvid_videokey=?, gnvid_order=? WHERE gnvid_id=?";
					connection.query(sql, [req.body.gnvid_videokey, req.body.gnvid_order, req.body.gnvid_id], function(err, gnvid){
						res.send({gnvid: true});
						connection.release();
					});
				});
	  		}
		 }
	});
});

router.post('/deletevideo', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "DELETE FROM tb_gn_video WHERE gnvid_id=?";
		connection.query(sql, [req.body.gnvid_id], function(err, gnvid){
			res.send({gnvid: true});
			connection.release();
		});
	});
});

router.post('/getmdsdata', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "SELECT * FROM tb_model WHERE md_gn_id=? AND md_bc_id=? ORDER BY md_order ASC";
		connection.query(sql, [req.body.gn_id, req.body.bc_id], function(err, mds){

			res.send({mds: mds});
			connection.release();
		});
	});
});

router.post('/getmddata', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "SELECT * FROM tb_model WHERE md_id=?";
		connection.query(sql, [req.body.md_id], function(err, md){

			var sql = "SELECT * FROM tb_md_detail WHERE mddtl_md_id=?";
			connection.query(sql, [req.body.md_id], function(err, mddtls){
				res.send({md: md[0], mddtls: mddtls});
				connection.release();
			});
		});
	});
});

router.post('/mdinsert', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	var mddtls = req.body['mddtl_name[]'];

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_generation SET gn_md_count = gn_md_count + 1 WHERE gn_id=?";
		connection.query(sql, [req.body.gn_id], function(err, gn){
			var sql = "INSERT INTO tb_model(md_order, md_br_id, md_lu_id, "+
					"md_gn_id, md_mddtl_count, md_bc_id, md_name, md_year, md_fueltype, "+
					"md_displacement, md_maxride) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
	
			var paramSQL = [];
			paramSQL.push(req.body.md_order);
			paramSQL.push(req.body.br_id);
			paramSQL.push(req.body.lu_id);
			paramSQL.push(req.body.gn_id);
			if(mddtls){
				if(Array.isArray(mddtls)){
					paramSQL.push(mddtls.length);
				}else{
					paramSQL.push(1);
				}
			}else{
				paramSQL.push(0);
			}
			paramSQL.push(req.body.md_bc_id);
			paramSQL.push(req.body.md_name);
			paramSQL.push(req.body.md_year);
			paramSQL.push(req.body.md_fueltype);
			paramSQL.push(req.body.md_displacement);
			paramSQL.push(req.body.md_maxride);

			connection.query(sql, paramSQL, function(err, md){
				if(err) console.error(err);

				var msql = "";

				if(mddtls){
					if(Array.isArray(mddtls)){
						for(var i = 0; i < mddtls.length; i++){
							msql += 'INSERT INTO tb_md_detail(mddtl_md_id, mddtl_name) VALUES('+md.insertId+',\''+mddtls[i]+'\');';
						}
					}else{
						msql += 'INSERT INTO tb_md_detail(mddtl_md_id, mddtl_name) VALUES('+md.insertId+',\''+mddtls+'\');';
					}
				}

				if(msql){
					connection.query(msql, function(err, mddtls){
						if(err) console.error(err);

						if(Array.isArray(mddtls)){
							var msql = '';
							for(var i = 0; i < mddtls.length; i++){
								if(mddtls[i].insertId != 0){
									msql += 'INSERT INTO tb_mddtl_size(mdsiz_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_engine(mdeng_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_driving(mddri_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_fuel(mdfue_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_performance(mdper_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_safety(mdsaf_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_external(mdext_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_seat(mdsea_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_convenience(mdcon_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_avsystem(mdavs_mddtl_id) VALUES('+mddtls[i].insertId+');';
								}
							}

							if(msql){
								connection.query(msql, function(err, mdspecs){
									if(err) console.error(err);

									res.send({md: true});
									connection.release();
								});
							}else{
								res.send({md: true});
								connection.release();
							}

						}else{
							if(mddtls.insertId != 0){
								var msql = '';
								msql += 'INSERT INTO tb_mddtl_size(mdsiz_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_engine(mdeng_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_driving(mddri_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_fuel(mdfue_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_performance(mdper_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_safety(mdsaf_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_external(mdext_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_seat(mdsea_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_convenience(mdcon_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_avsystem(mdavs_mddtl_id) VALUES('+mddtls.insertId+');';

								connection.query(msql, function(err, mdspec){
									if(err) console.error(err);

									res.send({md: true});
									connection.release();
								});
							}else{
								res.send({md: true});
								connection.release();
							}
						}
					});
				}else{
					res.send({md: true});
					connection.release();
				}
			});
		});
	});
});

router.post('/mdupdate', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	var mddtlName_new = req.body['mddtl_name_new[]'];
	var mddtlName_old = req.body['mddtl_name_old[]'];
	var removemddtlId = req.body['removemddtl[]'];
	var updatemddtlId = req.body['updatemddtl[]'];

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_model SET md_order=?, md_mddtl_count=?, md_name=?, md_year=?, md_fueltype=?, md_displacement=?, md_maxride=? WHERE md_id=?";

		var paramSQL = [];
		paramSQL.push(req.body.md_order);
		if(mddtlName_new && mddtlName_old){
			if(Array.isArray(mddtlName_new) && Array.isArray(mddtlName_old)){
				paramSQL.push(mddtlName_new.length+mddtlName_old.length);
			}else if(Array.isArray(mddtlName_new) && !Array.isArray(mddtlName_old)){
				paramSQL.push(mddtlName_new.length+1);
			}else if(!Array.isArray(mddtlName_new) && Array.isArray(mddtlName_old)){
				paramSQL.push(mddtlName_old.length+1);
			}else if(!Array.isArray(mddtlName_new) && !Array.isArray(mddtlName_old)){
				paramSQL.push(2);
			}
		}else if(mddtlName_new && !mddtlName_old){
			if(Array.isArray(mddtlName_new)){
				paramSQL.push(mddtlName_new.length);
			}else{
				paramSQL.push(1);
			}
		}else{
			if(!mddtlName_old){
				paramSQL.push(0);
			}else{
				if(Array.isArray(mddtlName_old)){
					paramSQL.push(mddtlName_old.length);
				}else{
					paramSQL.push(1);
				}
			}
		}
		paramSQL.push(req.body.md_name);
		paramSQL.push(req.body.md_year);
		paramSQL.push(req.body.md_fueltype);
		paramSQL.push(req.body.md_displacement);
		paramSQL.push(req.body.md_maxride);
		paramSQL.push(req.body.md_id);

		connection.query(sql, paramSQL, function(err, md){
			if(err) console.error(err);

			var msql = '';

			if(mddtlName_new){
				if(Array.isArray(mddtlName_new)){
					for(var i = 0; i < mddtlName_new.length; i++){
						msql += 'INSERT INTO tb_md_detail(mddtl_md_id, mddtl_name) VALUES('+req.body.md_id+',\''+mddtlName_new[i]+'\');';
					}
				}else{
					msql += 'INSERT INTO tb_md_detail(mddtl_md_id, mddtl_name) VALUES('+req.body.md_id+',\''+mddtlName_new+'\');';
				}
			}

			if(removemddtlId){
				if(Array.isArray(removemddtlId)){
					for(var i = 0; i < removemddtlId.length; i++){
						msql += 'DELETE FROM tb_md_detail WHERE mddtl_id='+removemddtlId[i]+';';
					}
				}else{
					msql += 'DELETE FROM tb_md_detail WHERE mddtl_id='+removemddtlId+';';
				}
			}

			if(mddtlName_old){
				if(Array.isArray(mddtlName_old)){
					for(var i = 0; i < mddtlName_old.length; i++){
						msql += 'UPDATE tb_md_detail SET mddtl_name=\''+mddtlName_old[i]+'\' WHERE mddtl_id='+updatemddtlId[i]+';';
					}
				}else{
					msql += 'UPDATE tb_md_detail SET mddtl_name=\''+mddtlName_old+'\' WHERE mddtl_id='+updatemddtlId+';';
				}
			}

			if(mddtlName_new || removemddtlId || mddtlName_old){

				if(msql){
					connection.query(msql, function(err, mddtls){
						if(err) console.error(err);

						if(Array.isArray(mddtls)){
							var msql = '';
							for(var i = 0; i < mddtls.length; i++){
								if(mddtls[i].insertId != 0){
									msql += 'INSERT INTO tb_mddtl_size(mdsiz_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_engine(mdeng_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_driving(mddri_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_fuel(mdfue_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_performance(mdper_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_safety(mdsaf_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_external(mdext_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_seat(mdsea_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_convenience(mdcon_mddtl_id) VALUES('+mddtls[i].insertId+');';
									msql += 'INSERT INTO tb_mddtl_avsystem(mdavs_mddtl_id) VALUES('+mddtls[i].insertId+');';
								}
							}

							if(msql){
								connection.query(msql, function(err, mdspecs){
									if(err) console.error(err);

									res.send({md: true});
									connection.release();
								});
							}else{
								res.send({md: true});
								connection.release();
							}

						}else{
							if(mddtls.insertId != 0){
								var msql = '';
								msql += 'INSERT INTO tb_mddtl_size(mdsiz_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_engine(mdeng_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_driving(mddri_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_fuel(mdfue_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_performance(mdper_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_safety(mdsaf_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_external(mdext_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_seat(mdsea_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_convenience(mdcon_mddtl_id) VALUES('+mddtls.insertId+');';
								msql += 'INSERT INTO tb_mddtl_avsystem(mdavs_mddtl_id) VALUES('+mddtls.insertId+');';

								connection.query(msql, function(err, mdspec){
									if(err) console.error(err);

									res.send({md: true});
									connection.release();
								});
							}else{
								res.send({md: true});
								connection.release();
							}
						}
					});
				}else{
					res.send({md: true});
					connection.release();
				}
			}else{
				res.send({md: true});
				connection.release();
			}
		});
	});
});

router.post('/mddelete', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	pool.getConnection(function(err, connection){
		var sql = "UPDATE tb_generation SET gn_md_count = gn_md_count - 1 WHERE gn_id=?";
		connection.query(sql, [req.body.gn_id], function(err, gn){
			var sql = "DELETE FROM tb_model WHERE md_id=?";
			connection.query(sql, [req.body.md_id], function(err, md){
				res.send({md: true});
				connection.release();
			});
		});
	});
});

module.exports = router;