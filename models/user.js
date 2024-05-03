const mongoose = require("mongoose");
const { Schema, model } = mongoose; // Destructure Schema and model from mongoose
const { createHmac ,randomBytes} = require('crypto');
const {createTokenForUser,validateToken}=   require("../services/authentication");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageUrl: {
        type: String,
        default: "/images/profile.jpg",
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    }
}, { timestamps: true });

userSchema.pre("save", function(next) {
    const user = this;

    if (!user.isModified("password")) return;

    const salt = randomBytes(16).toString();
    const hashedpassword = createHmac('sha256', salt)
          .update(user.password)
          .digest('hex');

    this.salt = salt;
    this.password = hashedpassword;

    next();
});

//match password:
userSchema.static("matchPasswordAndGenerateToken", async function(email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error('User Not found');

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac('sha256', salt)
        .update(password)
        .digest('hex');

    if (hashedPassword !== userProvidedHash)
        throw new Error("Incorrect Password");

    const token=createTokenForUser(user);
    return token;
});


const User = model("user",userSchema); 

module.exports = User;
