const jwt = require('jsonwebtoken')
const config = require('../config')


async function verifyToken(req,res,next){
    const token = req.headers['x-access-token'];
    if(!token){

        return res.status(401).send({auth:false,message:"No token provided"});
    }

    const decoded = await jwt.verify(token,config.secreto);
    req.userId = decoded.id;

    next();
}

module.exports = verifyToken;