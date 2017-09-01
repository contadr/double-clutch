var express = require('express');
var mysql = require('mysql');
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

			var sql = 'SELECT * FROM tb_model WHERE md_id=?';
			connection.query(sql, [req.query.md_id], function(err, md){
				md = JSON.parse(JSON.stringify(md[0]));

				var sql = 'SELECT * FROM tb_md_detail WHERE mddtl_id=?';
				connection.query(sql, [req.query.mddtl_id], function(err, mddtl){
					mddtl = JSON.parse(JSON.stringify(mddtl[0]));

					var sql_mdsiz = 'SELECT * FROM tb_mddtl_size WHERE mdsiz_mddtl_id=?';
					var sql_mdeng = 'SELECT * FROM tb_mddtl_engine WHERE mdeng_mddtl_id=?';
					var sql_mddri = 'SELECT * FROM tb_mddtl_driving WHERE mddri_mddtl_id=?';
					var sql_mdfue = 'SELECT * FROM tb_mddtl_fuel WHERE mdfue_mddtl_id=?';
					var sql_mdper = 'SELECT * FROM tb_mddtl_performance WHERE mdper_mddtl_id=?';
					var sql_mdsaf = 'SELECT * FROM tb_mddtl_safety WHERE mdsaf_mddtl_id=?';
					var sql_mdext = 'SELECT * FROM tb_mddtl_external WHERE mdext_mddtl_id=?';
					var sql_mdsea = 'SELECT * FROM tb_mddtl_seat WHERE mdsea_mddtl_id=?';
					var sql_mdcon = 'SELECT * FROM tb_mddtl_convenience WHERE mdcon_mddtl_id=?';
					var sql_mdavs = 'SELECT * FROM tb_mddtl_avsystem WHERE mdavs_mddtl_id=?';

					connection.query(sql_mdsiz, [mddtl.mddtl_id], function(err, mdsiz){ mdsiz = JSON.parse(JSON.stringify(mdsiz[0]));
					connection.query(sql_mdeng, [mddtl.mddtl_id], function(err, mdeng){ mdeng = JSON.parse(JSON.stringify(mdeng[0]));
					connection.query(sql_mddri, [mddtl.mddtl_id], function(err, mddri){ mddri = JSON.parse(JSON.stringify(mddri[0]));
					connection.query(sql_mdfue, [mddtl.mddtl_id], function(err, mdfue){ mdfue = JSON.parse(JSON.stringify(mdfue[0]));
					connection.query(sql_mdper, [mddtl.mddtl_id], function(err, mdper){ mdper = JSON.parse(JSON.stringify(mdper[0]));
					connection.query(sql_mdsaf, [mddtl.mddtl_id], function(err, mdsaf){ mdsaf = JSON.parse(JSON.stringify(mdsaf[0]));
					connection.query(sql_mdext, [mddtl.mddtl_id], function(err, mdext){ mdext = JSON.parse(JSON.stringify(mdext[0]));
					connection.query(sql_mdsea, [mddtl.mddtl_id], function(err, mdsea){ mdsea = JSON.parse(JSON.stringify(mdsea[0]));
					connection.query(sql_mdcon, [mddtl.mddtl_id], function(err, mdcon){ mdcon = JSON.parse(JSON.stringify(mdcon[0]));
					connection.query(sql_mdavs, [mddtl.mddtl_id], function(err, mdavs){ mdavs = JSON.parse(JSON.stringify(mdavs[0]));
					
						res.render('model', {
							br_id: req.query.br_id,
							br_korName: req.query.br_korName,
							br_engName: req.query.br_engName,
							lu_id: req.query.lu_id,
							lu_name: req.query.lu_name,
							gn_id: req.query.gn_id,
							gn_name: req.query.gn_name,
							md_id: req.query.md_id,
							md_name: req.query.md_name,
							bc_name: req.query.bc_name,
							active: req.query.active,
							md: md,
							mddtl: mddtl,
							mdsiz: mdsiz, mdeng: mdeng, mddri: mddri, mdfue: mdfue, mdper: mdper,
							mdsaf: mdsaf, mdext: mdext, mdsea: mdsea, mdcon: mdcon, mdavs: mdavs
						});
						connection.release();

					});});});});});});});});});});
				});
			});
		});
	}
});

router.post('/updatespec', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	var paramSQL_mddtl = [];
	var paramSQL_mdsiz = [];
	var paramSQL_mdeng = [];
	var paramSQL_mddri = [];
	var paramSQL_mdfue = [];
	var paramSQL_mdper = [];

	paramSQL_mddtl.push(req.body['mddtl[mddtl_price]']);
	paramSQL_mddtl.push(req.body['mddtl[mddtl_at]']);
	paramSQL_mddtl.push(req.body.mddtl_id);
	var sql_mddtl = "UPDATE tb_md_detail SET mddtl_price=?, mddtl_at=? WHERE mddtl_id=?";

	paramSQL_mdsiz.push(req.body['mdsiz[mdsiz_length]']);
	paramSQL_mdsiz.push(req.body['mdsiz[mdsiz_width]']);
	paramSQL_mdsiz.push(req.body['mdsiz[mdsiz_height]']);
	paramSQL_mdsiz.push(req.body['mdsiz[mdsiz_wheelbase]']);
	paramSQL_mdsiz.push(req.body['mdsiz[mdsiz_frontthread]']);
	paramSQL_mdsiz.push(req.body['mdsiz[mdsiz_rearthread]']);
	paramSQL_mdsiz.push(req.body.mddtl_id);
	var sql_mdsiz = "UPDATE tb_mddtl_size SET mdsiz_length=?, mdsiz_width=?, mdsiz_height=?, mdsiz_wheelbase=?, mdsiz_frontthread=?, mdsiz_rearthread=? WHERE mdsiz_mddtl_id=?";

	paramSQL_mdeng.push(req.body['mdeng[mdeng_type]']);
	paramSQL_mdeng.push(req.body['mdeng[mdeng_maxps]']);
	paramSQL_mdeng.push(req.body['mdeng[mdeng_maxkgm]']);
	paramSQL_mdeng.push(req.body.mddtl_id);
	var sql_mdeng = "UPDATE tb_mddtl_engine SET mdeng_type=?, mdeng_maxps=?, mdeng_maxkgm=? WHERE mdeng_mddtl_id=?";

	paramSQL_mddri.push(req.body['mddri[mddri_type]']);
	paramSQL_mddri.push(req.body['mddri[mddri_transmission]']);
	paramSQL_mddri.push(req.body['mddri[mddri_wd4system]']);
	paramSQL_mddri.push(req.body['mddri[mddri_powerstearing]']);
	paramSQL_mddri.push(req.body['mddri[mddri_suspension]']);
	paramSQL_mddri.push(req.body['mddri[mddri_break]']);
	paramSQL_mddri.push(req.body['mddri[mddri_tire]']);
	paramSQL_mddri.push(req.body['mddri[mddri_wheel]']);
	paramSQL_mddri.push(req.body.mddtl_id);
	var sql_mddri = "UPDATE tb_mddtl_driving SET mddri_type=?, mddri_transmission=?, mddri_wd4system=?, mddri_powerstearing=?, mddri_suspension=?, mddri_break=?, mddri_tire=?, mddri_wheel=?  WHERE mddri_mddtl_id=?";

	paramSQL_mdfue.push(req.body['mdfue[mdfue_complex]']);
	paramSQL_mdfue.push(req.body['mdfue[mdfue_downtown]']);
	paramSQL_mdfue.push(req.body['mdfue[mdfue_highspeed]']);
	paramSQL_mdfue.push(req.body['mdfue[mdfue_co2]']);
	paramSQL_mdfue.push(req.body['mdfue[mdfue_curbweight]']);
	paramSQL_mdfue.push(req.body['mdfue[mdfue_gastank]']);
	paramSQL_mdfue.push(req.body.mddtl_id);
	var sql_mdfue = "UPDATE tb_mddtl_fuel SET mdfue_complex=?, mdfue_downtown=?, mdfue_highspeed=?, mdfue_co2=?, mdfue_curbweight=?, mdfue_gastank=? WHERE mdfue_mddtl_id=?";

	paramSQL_mdper.push(req.body['mdper[mdper_zerotohundred]']);
	paramSQL_mdper.push(req.body['mdper[mdper_maxspeed]']);
	paramSQL_mdper.push(req.body.mddtl_id);
	var sql_mdper = "UPDATE tb_mddtl_performance SET mdper_zerotohundred=?, mdper_maxspeed=? WHERE mdper_mddtl_id=?";

	pool.getConnection(function(err, connection){
		connection.query(sql_mddtl, paramSQL_mddtl, function(err, mddtl){ if(err) console.error(err);
			connection.query(sql_mdsiz, paramSQL_mdsiz, function(err, mdsiz){ if(err) console.error(err);
				connection.query(sql_mdeng, paramSQL_mdeng, function(err, mdeng){ if(err) console.error(err);
					connection.query(sql_mddri, paramSQL_mddri, function(err, mddri){ if(err) console.error(err);
						connection.query(sql_mdfue, paramSQL_mdfue, function(err, mdfue){ if(err) console.error(err);
							connection.query(sql_mdper, paramSQL_mdper, function(err, mdper){ if(err) console.error(err);
								res.send({mddtl: true});
								connection.release();
							});
						});
					});
				});
			});
		});
	});
});

router.post('/updateoption', function(req, res){
	console.log("connect IP : " + req.connection.remoteAddress);

	var paramSQL_mddtl = [];
	var paramSQL_mdsaf = [];
	var paramSQL_mdext = [];
	var paramSQL_mdsea = [];
	var paramSQL_mdcon = [];
	var paramSQL_mdavs = [];

	paramSQL_mddtl.push(req.body['mddtl[mddtl_roommirror]']);
	paramSQL_mddtl.push(req.body['mddtl[mddtl_airconditioner]']);
	paramSQL_mddtl.push(req.body.mddtl_id);
	var sql_mddtl = "UPDATE tb_md_detail SET mddtl_roommirror=?, mddtl_airconditioner=? WHERE mddtl_id=?";

	paramSQL_mdsaf.push(req.body['mdsaf[mdsaf_airbag]']);
	paramSQL_mdsaf.push(req.body['mdsaf[mdsaf_drivingsafety]']);
	paramSQL_mdsaf.push(req.body['mdsaf[mdsaf_etc]']);
	paramSQL_mdsaf.push(req.body.mddtl_id);
	var sql_mdsaf = "UPDATE tb_mddtl_safety SET mdsaf_airbag=?, mdsaf_drivingsafety=?, mdsaf_etc=? WHERE mdsaf_mddtl_id=?";

	paramSQL_mdext.push(req.body['mdext[mdext_headlamp]']);
	paramSQL_mdext.push(req.body['mdext[mdext_rearlamp]']);
	paramSQL_mdext.push(req.body['mdext[mdext_foglights]']);
	paramSQL_mdext.push(req.body['mdext[mdext_sunroof]']);
	paramSQL_mdext.push(req.body['mdext[mdext_outsidemirror]']);
	paramSQL_mdext.push(req.body['mdext[mdext_etc]']);
	paramSQL_mdext.push(req.body.mddtl_id);
	var sql_mdext = "UPDATE tb_mddtl_external SET mdext_headlamp=?, mdext_rearlamp=?, mdext_foglights=?, mdext_sunroof=?, mdext_outsidemirror=?, mdext_etc=? WHERE mdext_mddtl_id=?";

	paramSQL_mdsea.push(req.body['mdsea[mdsea_arrangement]']);
	paramSQL_mdsea.push(req.body['mdsea[mdsea_material]']);
	paramSQL_mdsea.push(req.body['mdsea[mdsea_driver]']);
	paramSQL_mdsea.push(req.body['mdsea[mdsea_passenger]']);
	paramSQL_mdsea.push(req.body['mdsea[mdsea_column2]']);
	paramSQL_mdsea.push(req.body['mdsea[mdsea_etc]']);
	paramSQL_mdsea.push(req.body.mddtl_id);
	var sql_mdsea = "UPDATE tb_mddtl_seat SET mdsea_arrangement=?, mdsea_material=?, mdsea_driver=?, mdsea_passenger=?, mdsea_column2=?, mdsea_etc=? WHERE mdsea_mddtl_id=?";

	paramSQL_mdcon.push(req.body['mdcon[mdcon_stearingwheel]']);
	paramSQL_mdcon.push(req.body['mdcon[mdcon_powerwindow]']);
	paramSQL_mdcon.push(req.body['mdcon[mdcon_parkingsystem]']);
	paramSQL_mdcon.push(req.body['mdcon[mdcon_wlandoorlock]']);
	paramSQL_mdcon.push(req.body['mdcon[mdcon_smartkey]']);
	paramSQL_mdcon.push(req.body['mdcon[mdcon_cruise]']);
	paramSQL_mdcon.push(req.body['mdcon[mdcon_etc]']);
	paramSQL_mdcon.push(req.body.mddtl_id);
	var sql_mdcon = "UPDATE tb_mddtl_convenience SET mdcon_stearingwheel=?, mdcon_powerwindow=?, mdcon_parkingsystem=?, mdcon_wlandoorlock=?, mdcon_smartkey=?, mdcon_cruise=?, mdcon_etc=? WHERE mdcon_mddtl_id=?";

	paramSQL_mdavs.push(req.body['mdavs[mdavs_audio]']);
	paramSQL_mdavs.push(req.body['mdavs[mdavs_speaker]']);
	paramSQL_mdavs.push(req.body['mdavs[mdavs_terminal]']);
	paramSQL_mdavs.push(req.body['mdavs[mdavs_navigation]']);
	paramSQL_mdavs.push(req.body['mdavs[mdavs_etc]']);
	paramSQL_mdavs.push(req.body.mddtl_id);
	var sql_mdavs = "UPDATE tb_mddtl_avsystem SET mdavs_audio=?, mdavs_speaker=?, mdavs_terminal=?, mdavs_navigation=?, mdavs_etc=? WHERE mdavs_mddtl_id=?";

	pool.getConnection(function(err, connection){
		connection.query(sql_mddtl, paramSQL_mddtl, function(err, mddtl){ if(err) console.error(err);
			connection.query(sql_mdsaf, paramSQL_mdsaf, function(err, mdsaf){ if(err) console.error(err);
				connection.query(sql_mdext, paramSQL_mdext, function(err, mdext){ if(err) console.error(err);
					connection.query(sql_mdsea, paramSQL_mdsea, function(err, mdsea){ if(err) console.error(err);
						connection.query(sql_mdcon, paramSQL_mdcon, function(err, mdcon){ if(err) console.error(err);
							connection.query(sql_mdavs, paramSQL_mdavs, function(err, mdavs){ if(err) console.error(err);
								res.send({mddtl: true});
								connection.release();
							});
						});
					});
				});
			});
		});
	});
});

module.exports = router;