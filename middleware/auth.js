const { StatusCodes } = require('http-status-codes')
const jwt = require('jsonwebtoken')

const authMiddleware = async (req,res,next) => {
    try {
        // let token =  req.header('Authorization')
        let { login_token } = req.signedCookies

        if(!login_token) 
            return res.status(StatusCodes.NOT_FOUND).json({msg: `token not found`})

        // verify
        await jwt.verify(login_token, process.env.SECRET_KEY,(err,data) => {
            if(err)
                return res.status(StatusCodes.UNAUTHORIZED).json({ msg: err.message })

            let { id } = data
            req.userId = id;

            next()
        })
    }catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    } 
}

module.exports = authMiddleware