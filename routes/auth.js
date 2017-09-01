var express = require('express');
var mysql = require('mysql');
var dbconfig = require('./config/database.js');
var sign = require('./config/sign.js');
var pool = mysql.createPool(dbconfig);
var router = express.Router();

router.get('/', function(req, res, next){
  console.log("connect IP : " + req.connection.remoteAddress);

  res.render('auth');
});

router.post('/login', function(req, res, next){
  console.log("connect IP : " + req.connection.remoteAddress);

  var uid = req.body.uid;
  var upass = req.body.upass;

  if(uid == sign.id && upass == sign.password){

    var userInfo = {
      user_id: uid
    };
    req.session.userInfo = userInfo;

    res.send({auth: true});
  }else{
    res.send({auth: false});
  }
});

router.get('/logout', function(req, res, next){
  console.log("connect IP : " + req.connection.remoteAddress);
  
  req.session.destroy(function(err){
    res.redirect('/admin');
  });
});

module.exports = router;