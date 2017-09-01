var express = require('express');
// var multer = require('multer');
// var _storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//   	console.log(req.body);
//   	//cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//   	console.log(req.body);
//   	//cb(null, req.body.id+'_'+file.originalname);
//   }
// });
// var upload = multer({ storage: _storage });
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log("connect IP : " + req.connection.remoteAddress);

  	res.render('index', { title: 'Double Clutch' });
});

// router.post('/uploadtest', upload.single('user_file'), function(req, res){
// 	console.log(req.body);
// 	res.send({hi: "upload"});
// });

module.exports = router;
