const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config();


const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });


userSchema.methods.generateToken = function (){
    return jwt.sign(
        {
            userId: this._id,
            email: this.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE
        }
    )
}



// --->> password hash 
userSchema.pre("save", async function(){
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
})


// -->> password comp
userSchema.methods.comparePassword = async function(enteredPassword) {

    return await bcrypt.compare(
        enteredPassword,
        this.password
    );

}


const User = mongoose.model("User", userSchema);

module.exports = User;

