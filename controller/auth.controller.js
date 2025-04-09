const { StatusCodes } = require("http-status-codes")
const UserModel = require('../model/user')
const bcrypt = require('bcryptjs')
const mailHandler = require('../config/mail')
const generateToken = require('../util/token')

// register
const  regController = async (req,res) => {
    try {
        let { name,email, mobile,password } = req.body 

        // validate 
        let extUser = await UserModel.findOne({email})
            if(extUser)
                return res.status(StatusCodes.CONFLICT).json({ msg: `user ${email} already registered` })

        // encrypt (hash) the password
        let hashPass = await bcrypt.hash(password,10)
        
        // save the data into db
        let newUser = await UserModel.create({
            name,
            email,
            mobile,
            password: hashPass
        })

        let temp = `<div>
                        <h4>Hi ${name}, Thank you for registerting in our portal.</h4>
                        <table>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Mobile</th>
                            </tr>
                            <tr>
                                <td> ${name} </td>
                                <td> ${email} </td>
                                <td> ${mobile} </td>
                            </tr>
                        </table>
                        <hr>

                        <h5>Regards,</h5>
                        <p> Team Auth API.</p>
                    </div>`

        await mailHandler(email,"User Registration",temp)
            .then(out => {
        res.status(StatusCodes.ACCEPTED).json({ msg: "user registered successfully", user: newUser })
            }).catch(err => {
                return res.status(StatusCodes.CONFLICT).json({ msg: err.message })
            })

    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    }
}
// login
const  loginController = async (req,res) => {
    try {

        let { email, password } = req.body 

        // verify the email
        let exUser = await UserModel.findOne({email})
            if(!exUser)
                return res.status(StatusCodes.NOT_FOUND).json({ msg: `requested ${email} not found`})

        // compare the password
        let verifyPass = await bcrypt.compare(password,exUser.password)
            if(!verifyPass)
                return res.status(StatusCodes.UNAUTHORIZED).json({ msg: `Passwords are not matched..`})

        // login token
        let token = await generateToken(exUser._id)

        // cookies
        res.cookie("login_token", token, {
            httpOnly: true,
            signed: true,
            path: `/`,
            maxAge: 1 * 24 * 60 * 60 * 1000
        })
        
        res.json({ msg: "login successful", token, role: exUser.role })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    }
}
// logout
const  logoutController = async (req,res) => {
    try {
        res.clearCookie("login_token", { path: "/"})

        res.json({ msg: "logout successful"})
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    }
}
// verify
const  verifyController = async (req,res) => {
    try {
        let id = req.userId 

        // verify the user
        let exUser = await UserModel.findById({_id: id }).select("-password")
            if(!exUser)
                return res.status(StatusCodes.NOT_FOUND).json({ msg: `request user id not found..`})
        

        res.json({ msg: "verified successful", user: exUser })
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    }
}
// forgot password
const  forgotPassController = async (req,res) => {
    try {
        let  { email } = req.body 

        // verify email
        let exUser = await UserModel.findOne({email})
            if(!exUser)
                return res.status(StatusCodes.NOT_FOUND).json({ msg: `requested ${email} id not found`})

        // send an email to the user to update the password
        let num = Math.floor(100000 + Math.random() * 900000);

        // template
        let template = `<div>
                          <h1>Hi ${exUser.name}, We processed the request for generating new password..</h1>
                          <h3>OTP: <strong> <mark>${num}</mark> </strong> </h3>
                      </div>`

        await UserModel.findOneAndUpdate({email}, { otp: num })

        // send email to user and store the the otp
          await mailHandler(exUser.email, "Reset Password",template)
          .then(out => {
                res.status(StatusCodes.OK).json({ msg: "Otp sent successfully..check your mail inbox.."})
          })
          .catch(err => {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
          })
        
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    }
}
// update password
const  updatePassController = async (req,res) => {
    try {

        let { email, password, otp } = req.body

          // verify email
        let exUser = await UserModel.findOne({email})
          if(!exUser)
              return res.status(StatusCodes.NOT_FOUND).json({ msg: `requested ${email} id not found`})

        // compare otp
        if(exUser.otp !== otp)
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "invalid otp.."})

        // compare with existing password
        let cmpPass = await bcrypt.compare(password,exUser.password)
            if(cmpPass)
                return res.status(StatusCodes.NOT_ACCEPTABLE).json({ msg: `you have entered old password.. try new or login with old password.`})

        // update the password
        let encPass = await bcrypt.hash(password,10)

        await UserModel.findOneAndUpdate({email}, { 
            password: encPass,
            otp: 0
        })
        
        res.status(StatusCodes.OK).json({ msg: "password updated successfully"})
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message })
    }
}


module.exports = { regController, loginController, logoutController, verifyController, forgotPassController, updatePassController }