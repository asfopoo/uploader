var express = require('express');
  var app = express();
  var bodyParser = require('body-parser');
  var multer = require('multer');
  var xlstojson = require("xls-to-json-lc");
  var xlsxtojson = require("xlsx-to-json-lc");
  app.use(bodyParser.json());
  var storage = multer.diskStorage({ //multers disk storage settings
      destination: function (req, file, cb) {
          cb(null, './uploads/')
      },
      filename: function (req, file, cb) {
          var datetimestamp = Date.now();
          cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
      }
  });
  var upload = multer({ //multer settings
                  storage: storage,
                  fileFilter : function(req, file, callback) { //file filter
                      if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                          return callback(new Error('Wrong extension type'));
                      }
                      callback(null, true);
                  }
              }).single('file');
  /** API path that will upload the files */
  app.post('/upload', function(req, res) {
    return new Promise((resolve, reject) => {
      var exceltojson;
      upload(req,res,function(err){
          if(err){
               res.json({error_code:1,err_desc:err});
               return;
          }
          /** Multer gives us file info in req.file object */
          if(!req.file){
              res.json({error_code:1,err_desc:"No file passed"});
              return;
          }
          /** Check the extension of the incoming file and
           *  use the appropriate module
           */
          if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
              exceltojson = xlsxtojson;
          } else {
              exceltojson = xlstojson;
          }
          try {
              exceltojson({
                  input: req.file.path,
                  output: null, //'/myfile.json', //
                  lowerCaseHeaders:true
              }, function(err,result){
                  if(err) {
                      return res.json({error_code:1,err_desc:err, data: null});
                  }

                  res.json({error_code:0,err_desc:null, data: result}); //displays the json result... not needed necessarily
                  resolve(result);

              });


          } catch (e){
              res.json({error_code:1,err_desc:"Corupted excel file"});
          }})
          })
          .then(function(result) {
            console.log(result[0].domain);
            console.log(result.length);

/*
            for(let i = 0; i < result.length; i++){
              let statement = 'INSERT into public.leadgenmasterclean(domain, companyname, title, firstname, lastname, email, phone, linkedin, returnSoftware, shopifyPlus, state, vertical, source)\n'
              + 'values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

              let replacements = [result[i].domain, result[i].companyname, result[i].title, result[i].firstname, result[i].lastname, result[i].email, result[i].phone, result[i].linkedin, result[i].returnSoftware, result[i].shopifyPlus, result[i].state, result[i].vertical, result[i].source];

              return SqlQuery.query(
                statement,
                {replacements: replacements, type: SqlQuery.QueryTypes.SELECT}
            }
*/
      })
  });
  app.get('/',function(req,res){
      res.sendFile(__dirname + "/index.html");
  });
  app.listen('3000', function(){
      console.log('running on 3000...');
  });
