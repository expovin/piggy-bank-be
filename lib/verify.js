var jwt = require('jsonwebtoken'); 
const settings = require('../secrets');


var SECRET = settings.seed;
/** This function return the actual token after the user logged in */
exports.getToken = function (user) {
    console.log("[getToken] with user "+user);
    let moltiplica=1;
    return jwt.sign(user, SECRET, {
        expiresIn: settings.TokenExpirees * moltiplica
    });
};

exports.getUser = function (req, res, next){
    var token = req.headers['x-access-token'];
    return new Promise ( (fulfill, reject) =>{
        if (token) {
            jwt.verify(token, SECRET, function (err, decoded) {
                if (err) throw err;
                fulfill(decoded.email);
            })
        } else {
            reject("Token not provided!")
        }

    })    
}

exports.test = function(n) { return n+1 }



/** This function check if the token is still valid and belong to the ordinary user */
exports.verifyToken = function (req, res, next) {
//function verifyToken(token) {

    console.log("Start Tocken verification");
    console.log("URL : "+req.hostname);

    if(req.hostname == 'localhost' && process.env.DEVMODE == 'ON'){
        console.log("Dev mode ON no tocken required");
        req.decoded = {role:'DEV',email:'expovin@gmail.com',dominio:'alice.expovin.it'}
        next();
    } else {
        var token = req.headers['x-access-token'];

        // decode token
        if (token) {
            jwt.verify(token, SECRET, function (err, decoded) {
                if (err) {
                    var err = {}; //new Error('You are not authenticated!');
                    err.status = 401;
                    err.success=false;
                    err.message="Token verification error.";
                    next(err);
    
                } else {
                    console.log("Token verified : ",decoded);
                    if((decoded.role)){
                        req.decoded = decoded;
                        req.user=true;
                        req.process=false;
                        console.log("Ruolo : "+decoded.role);                    
                        next();
                        
                    }
                    else{
                        req.user=false;
                        req.process=true;    
                        var err = {}; //new Error('Profile does not fit the ordinary user');
                        err.status = 402;
                        err.success=false;
                        err.message="Token verification error.";                    
                        next(err);
                    }
                }
            });
        } else {
            var err = new Error('No token provided!');
            err.status = 403;
            console.log("Error Token not provided");
            next(err);
        }
    }



};