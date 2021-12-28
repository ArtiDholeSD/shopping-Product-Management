const {jwt} = require('../utils')
//--------------------ask mentor-----------------------------------------------
const authMiddleware = async (req, res, next) => {
    try {
        const bearerHeader = req.headers['authorization']
        console.log(bearerHeader)
        if(!bearerHeader) {
            res.status(403).send({status: false, message: `Missing authentication token in request`})
            return
        }
               const bearer= bearerHeader.split(' ');
               const bearerToken =bearer[1];
               req.token=bearerToken;
               console.log(bearerToken)

        const decoded = await jwt.verifyToken(bearerToken)

        if(!decoded) {
            res.status(403).send({status: false, message: `Invalid authentication token in request`})
            return
        }

        req.userId = decoded.userId
        console.log(req.userId)
        next()
    } catch (error) {
        console.error(`Error! ${error.message}`)
        res.status(500).send({status: false, message: error.message})
    }
}

module.exports = authMiddleware