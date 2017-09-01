var express = require('express');
var mysql = require('mysql');
var dbconfig = require('./config/database.js');
var pool = mysql.createPool(dbconfig);
var router = express.Router();

router.get('/', function(req, res, next){
  console.log("connect IP : " + req.connection.remoteAddress);

  require('date-utils');
  var dt = new Date();
  var d = dt.toFormat('YYYY-MM-DD HH24:MI:SS');
  console.log('현재 시간 - ' + '[' + d + ']');

  pool.getConnection(function(err, connection){
    var sql = "SELECT * FROM tb_brand WHERE br_country=?";
    connection.query(sql, ["KR"], function(err, krs){
      connection.query(sql, ["JP"], function(err, jps){
        connection.query(sql, ["CN"], function(err, cns){
          connection.query(sql, ["IN"], function(err, ins){
            connection.query(sql, ["AU"], function(err, aus){
              connection.query(sql, ["US"], function(err, uss){
                connection.query(sql, ["DE"], function(err, des){
                  connection.query(sql, ["IT"], function(err, its){
                    connection.query(sql, ["FR"], function(err, frs){
                      connection.query(sql, ["GB"], function(err, gbs){
                        connection.query(sql, ["SE"], function(err, ses){
                          connection.query(sql, ["CZ"], function(err, czs){
                            connection.release();
                            res.render('brand', {krs: krs, jps: jps
                              , cns: cns, ins: ins, aus: aus, uss: uss
                              , des: des, its: its, frs: frs, gbs: gbs
                              , ses: ses , czs: czs});
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

});

module.exports = router;