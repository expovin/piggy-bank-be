var express = require('express');
const Verify = require('../lib/verify');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.route('/approver')
.get(Verify.verifyToken, function(req, res, next) {
  let allawedRoles = ['User'];
  if(allawedRoles.indexOf(req.decoded.role) !== -1){

    req.dbConn.getApprover(req.decoded.email)
    .then( result => res.status(200).json({success:true, data:result}))
    .catch( error => {
      res.status(500).json({success:false, error:error})
    })
  }
  else {
    res.status(402).json({success:false, error:"Authorization Error: Non hai i diritti per questa chiamata"})
  }
})

router.route('/governed')
.get(Verify.verifyToken, function(req, res, next) {
  let allawedRoles = ['Approver'];
  if(allawedRoles.indexOf(req.decoded.role) !== -1){

    req.dbConn.getGoverned(req.decoded.email)
    .then( result => res.status(200).json({success:true, data:result}))
    .catch( error => {
      res.status(500).json({success:false, error:error})
    })
  }
  else {
    res.status(402).json({success:false, error:"Authorization Error: Non hai i diritti per questa chiamata"})
  }
})

router.route('/governed/transazioni')
.get(Verify.verifyToken, function(req, res, next) {
  let allawedRoles = ['Approver'];
  if(allawedRoles.indexOf(req.decoded.role) !== -1){

    req.dbConn.getGovernedTransactions(req.decoded.email, req.headers.child_id)
    .then( result => res.status(200).json({success:true, data:result}))
    .catch( error => {
      res.status(500).json({success:false, error:error})
    })
  }
  else {
    res.status(402).json({success:false, error:"Authorization Error: Non hai i diritti per questa chiamata"})
  }
})

router.route('/amount')
.get(Verify.verifyToken, function(req, res, next) {
  let allawedRoles = ['User'];
  if(allawedRoles.indexOf(req.decoded.role) !== -1){

    req.dbConn.getAmount(req.decoded.userId)
    .then( result => res.status(200).json({success:true, data:result}))
    .catch( error => {
      res.status(500).json({success:false, error:error})
    })
  }
  else {
    res.status(402).json({success:false, error:"Authorization Error: Non hai i diritti per questa chiamata"})
  }
})


router.route('/transactions')
.get(Verify.verifyToken, function(req, res, next) {
  let allawedRoles = ['User'];
  if(allawedRoles.indexOf(req.decoded.role) !== -1){

    req.dbConn.getTransactions(req.decoded.userId)
    .then( result => res.status(200).json({success:true, data:result}))
    .catch( error => {
      res.status(500).json({success:false, error:error})
    })
  }
  else {
    res.status(402).json({success:false, error:"Authorization Error: Non hai i diritti per questa chiamata"})
  }
})
.post(Verify.verifyToken, function(req, res, next) {
  let allawedRoles = ['User'];
  if(allawedRoles.indexOf(req.decoded.role) !== -1){

    req.dbConn.newTransaction({userId:req.decoded.userId, ammontare:req.body.ammontare, nota:req.body.nota})
    .then( result => res.status(200).json({success:true, data:result}))
    .catch( error => {
      res.status(500).json({success:false, error:error})
    })
  }
  else {
    res.status(402).json({success:false, error:"Authorization Error: Non hai i diritti per questa chiamata"})
  }
})

router.route('/transaction/approve')
.get(Verify.verifyToken, function(req, res, next) {
  let allawedRoles = ['Approver'];
  if(allawedRoles.indexOf(req.decoded.role) !== -1){

    req.dbConn.getTransactionsToApprove(req.decoded.userId)
    .then( result => res.status(200).json({success:true, data:result}))
    .catch( error => {
      res.status(500).json({success:false, error:error})
    })
  }
  else {
    res.status(402).json({success:false, error:"Authorization Error: Non hai i diritti per questa chiamata"})
  }
})
.put(Verify.verifyToken, function(req, res, next) {
  let allawedRoles = ['Approver'];
  if(allawedRoles.indexOf(req.decoded.role) !== -1){

    req.dbConn.approveTransaction(req.body.transactionId, req.decoded.userId)
    .then( result => res.status(200).json({success:true, data:result}))
    .catch( error => {
      res.status(500).json({success:false, error:error})
    })
  }
  else {
    res.status(402).json({success:false, error:"Authorization Error: Non hai i diritti per questa chiamata"})
  }
})

router.route('/me')
.get(Verify.verifyToken, function(req, res, next) {
  let allawedRoles = ['User','Admin','Approver'];
  
  if(allawedRoles.indexOf(req.decoded.role) !== -1){
    req.dbConn.getUserDetails(req.decoded.email)

    .then( result => res.status(200).json({success:true, data:result}))
    .catch( error => {
      res.status(500).json({success:false, error:error})
    })
  }
  else {
    res.status(402).json({success:false, error:"Authorization Error: Non hai i diritti per questa chiamata"})
  }
});


module.exports = router;
