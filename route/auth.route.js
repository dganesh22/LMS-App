const authRoute = require('express').Router()
const { regController, loginController, logoutController, verifyController, forgotPassController, updatePassController } = require('../controller/auth.controller')
const authMiddleware = require('../middleware/auth')

// register
authRoute.post(`/register`, regController)

// login
authRoute.post(`/login`, loginController)

// logout
authRoute.get(`/logout`, logoutController)

// verify user token
authRoute.get(`/verify`, authMiddleware, verifyController)

// generate otp token
authRoute.post(`/forgot/password`, forgotPassController)

// to update password
authRoute.patch(`/update/password`, updatePassController)

module.exports = authRoute