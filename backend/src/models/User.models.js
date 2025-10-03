import mongoose from "mongoose";
import bcrpyt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
    },
    
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    // profileImageUrl:{
    //     type: String,
    //     default: null
    // }

}, {timestamps: true});


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrpyt.hash(this.password, 10);
    next();    
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrpyt.compare(candidatePassword, this.password);
}

export  const User = mongoose.model("User", userSchema);