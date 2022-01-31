var express = require('express');
const passport = require('passport');
const Verify = require('../lib/verify');
var crypto = require('crypto');


var router = express.Router();


function myCustomGoogleAuthenticator(req, res, next){
  passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: req.query.state
  })(req, res, next);
  //^ call the middleware returned by passport.authenticate
}


/** Facebook Authentication */

router.get('/facebook', passport.authenticate('facebook', { scope : ['profile','email'] }));

router.get('/facebook/return',  passport.authenticate('facebook', { failureRedirect: '/errorLogin' }),
  function(req, res) {
    let user = {
      nome : req.user.name.givenName,
      cognome: req.user.name.familyName,
      email: req.user.emails[0].value,
      photo: ""
    }
    let dominio=req.query.state.substr(req.query.state.indexOf('/')+2,req.query.state.lastIndexOf(':') )
    req.dbConn.updateOrInsertUser(user, dominio)
    .then( result =>{
      let beseUrl = req.headers.referer.substring(0, req.headers.referer.lastIndexOf("/")) 
      let token = Verify.getToken({"email":req.user.emails[0].value,"role":result.gruppo,"dominio":dominio});
      res.redirect(req.query.state+'/?token='+token);
    })
    .catch( error => res.status(500).json({success:false, error:error}))   
  });


  /** Google Authentication */
  router.get('/google', myCustomGoogleAuthenticator);

  router.get('/google/return',  passport.authenticate('google', { failureRedirect: '/errorLogin' }),
    function(req, res) {
      console.log("Stato :"+req.query.state)
      let user = {
        nome : req.user.displayName.split(" ")[0],
        cognome: req.user.displayName.split(" ")[1],
        email: req.user.emails[0].value,
        photo: req.user.photos[0].value
      }  
      
      console.log(user);

      req.dbConn.getRole(user.email)
      .then( result =>{
        let role=result[0].role;
        let userId=result[0].userId;
        console.log("Ruolo : "+role+" userId : "+userId);
        let token = Verify.getToken({"email":user.email,"role":role, "userId":userId});
        console.log("Token : "+token);
        //res.redirect(url+'/?token='+token);
        res.status(200).json({token:token, user:user, role:role});
      })
      .catch( error => res.status(500).json({success:false, error:error}))
  });

  router.route('/login')
  .post(passport.authenticate('local', { failureRedirect: '/' }),
    function(req, res) {
      console.log(req.body);
      console.log("Login Succesfull!");
      res.redirect('/');
    }
  );

  router.put('/password', (req, res, next) => {
    var hashPasswd = crypto.createHash('md5').update(req.body.password).digest('hex');
    req.dbConn.resetPassword(req.body.username,hashPasswd)
    .then(result => res.json({hash:hashPasswd, password:req.body.password}))
    
  })

  router.post('/password', (req, res, next) => {
    var hashPasswd = crypto.createHash('md5').update(req.body.password).digest('hex');
    req.dbConn.checkPassword(req.body.username,hashPasswd)
    .then(result => res.json(result.data[0].exist))
    
  })


router.route('/error')
.get( (req, res, next) => {
    return res.status(200).json({result:'KO',message: "Errore autenticazione"});
})

module.exports = router;
