const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    otp: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
},{
    collection: "users",
    timestamps: true
})

module.exports = mongoose.model("UserModel",UserSchema)