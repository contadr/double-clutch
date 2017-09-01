var express = require('express');
var mysql = require('mysql');
var dbconfig = require('./config/database.js');
//var lu_cartype = require('./config/lu_cartype.js');
var pool = mysql.createPool(dbconfig);
var router = express.Router();

router.get('/', function(req, res, next){
	var state = true;
	res.send(state);
});

router.get('/selectbr', function(req, res, next){

  var br_country = req.query.br_country;

  pool.getConnection(function(err, connection){
    var sql = "SELECT * FROM tb_brand WHERE br_country=?";
    connection.query(sql, [br_country], function(err, brs){
      connection.release();
      res.send(brs);
    });
  });
});

router.get('/selectcart', function(req, res, next){

  pool.getConnection(function(err, connection){
    var sql = "SELECT * FROM tb_brand WHERE br_id=?";
    connection.query(sql, [req.query.br_id], function(err, br){
      br = JSON.parse(JSON.stringify(br[0]));

      var cart_lu = [];
      if(br.br_lgt_count > 0){ cart_lu.push({cartype: lu_cartype[0], count:br.br_lgt_count}); }
      if(br.br_sml_count > 0){ cart_lu.push({cartype: lu_cartype[1], count:br.br_sml_count}); }
      if(br.br_smd_count > 0){ cart_lu.push({cartype: lu_cartype[2], count:br.br_smd_count}); }
      if(br.br_mdm_count > 0){ cart_lu.push({cartype: lu_cartype[3], count:br.br_mdm_count}); }
      if(br.br_lrg_count > 0){ cart_lu.push({cartype: lu_cartype[4], count:br.br_lrg_count}); }
      if(br.br_hcb_count > 0){ cart_lu.push({cartype: lu_cartype[5], count:br.br_hcb_count}); }
      if(br.br_wgn_count > 0){ cart_lu.push({cartype: lu_cartype[6], count:br.br_wgn_count}); }
      if(br.br_suv_count > 0){ cart_lu.push({cartype: lu_cartype[7], count:br.br_suv_count}); }
      if(br.br_rvc_count > 0){ cart_lu.push({cartype: lu_cartype[8], count:br.br_rvc_count}); }
      if(br.br_van_count > 0){ cart_lu.push({cartype: lu_cartype[9], count:br.br_van_count}); }
      if(br.br_hyb_count > 0){ cart_lu.push({cartype: lu_cartype[10], count:br.br_hyb_count}); }
      if(br.br_elc_count > 0){ cart_lu.push({cartype: lu_cartype[11], count:br.br_elc_count}); }
      if(br.br_spt_count > 0){ cart_lu.push({cartype: lu_cartype[12], count:br.br_spt_count}); }
      if(br.br_cpe_count > 0){ cart_lu.push({cartype: lu_cartype[13], count:br.br_cpe_count}); }
      if(br.br_cvt_count > 0){ cart_lu.push({cartype: lu_cartype[14], count:br.br_cvt_count}); }
      if(br.br_sup_count > 0){ cart_lu.push({cartype: lu_cartype[15], count:br.br_sup_count}); }
      if(br.br_rac_count > 0){ cart_lu.push({cartype: lu_cartype[16], count:br.br_rac_count}); }
      if(br.br_trk_count > 0){ cart_lu.push({cartype: lu_cartype[17], count:br.br_trk_count}); }
      if(br.br_bus_count > 0){ cart_lu.push({cartype: lu_cartype[18], count:br.br_bus_count}); }
      if(br.br_cct_count > 0){ cart_lu.push({cartype: lu_cartype[19], count:br.br_cct_count}); }
      if(br.br_old_count > 0){ cart_lu.push({cartype: lu_cartype[20], count:br.br_old_count}); }
      if(br.br_etc_count > 0){ cart_lu.push({cartype: lu_cartype[21], count:br.br_etc_count}); }

      res.send(cart_lu);
      connection.release();
    });
  });

});

router.get('/selectlu', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = "SELECT * FROM tb_lineup WHERE lu_br_id=? AND ";
    sql += req.query.cart + "=1 ORDER BY lu_order ASC";
    connection.query(sql, [req.query.br_id], function(err, lus){
      res.send(lus);
      connection.release();
    });
  });
});

router.get('/selectgn', function(req, res, next){
  pool.getConnection(function(err, connection){
    var sql = "SELECT * FROM tb_generation WHERE gn_lu_id=? AND ";
    var splitstr = req.query.cart_col.split('lu_');
    splitstr = "gn_" + splitstr[1];
    sql += splitstr + "=1 ORDER BY gn_order ASC";

    connection.query(sql, [req.query.lu_id], function(err, gns){
      gns = JSON.parse(JSON.stringify(gns));

      for(var i = 0; i < gns.length; i++){
        if(!gns[i].gn_image){
          gns[i].gn_imgpath = '/images/-/md_thumb.jpg';
        }else{
          gns[i].gn_imgpath = '/images/'+req.query.br_id+'/'+req.query.lu_id+'/'+gns[i].gn_id+'/'+gns[i].gn_image;
        }
      }

      res.send(gns);
      connection.release();
    });
  });
});

router.get('/selectmd', function(req, res, next){

  pool.getConnection(function(err, connection){
    var sql = "SELECT * FROM tb_model WHERE md_lu_id=? AND ";
    var splitstr = req.query.cart_col.split('lu_');
    splitstr = "md_" + splitstr[1];
    sql += splitstr + "=1 ORDER BY md_order ASC";
    connection.query(sql, [req.query.lu_id], function(err, mds){
      mds = JSON.parse(JSON.stringify(mds));

      for(var i = 0; i < mds.length; i++){
        if(mds[i].md_minprice.length > 3){
          mds[i].md_showminprice = mds[i].md_minprice.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        if(mds[i].md_maxprice.length > 3){
          mds[i].md_showmaxprice = mds[i].md_maxprice.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        if(mds[i].md_thumbnail == '-'){
          mds[i].md_imgpath = '/images/-/md_thumb.jpg';
        }else{
          mds[i].md_imgpath = "/images/"+req.query.br_id+"/"+req.query.lu_id+"/"+mds[i].md_id+"/"+mds[i].md_thumbnail;
        }
      }
      res.send(mds);
      connection.release();
    });
  });
});

module.exports = router;
