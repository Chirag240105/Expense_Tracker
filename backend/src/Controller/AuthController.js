import jwt from "jsonwebtoken";
import { User } from "../models/User.models.js";



const generateToken = (id) =>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "1h"});
}

export const signUp = async(req, res) =>{
    const {username, email, password } = req.body;
    if (!username || !email || !password){
        return res.status(400).json({ message : "All fields are required"});
    }

    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "Email already in use"});
        }
        const user = await User.create({
            username,
            email,
            password,
        });
        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id)
        })
    }catch(err){
        res.status(500).json({message: "Error in registering user", error: err.message});
    }
};
export const login = async(req, res) =>{
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({message: "All fields are required."});
    }
    try{
        const user = await User.findOne({email});
        if (!user || !(await user.comparePassword(password))){
            return res.status(400).json({ message: "Invalid credentials"});
        }

        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id)
        });
    }catch(err){
      res.status(500).json({message: "Errorin registering user", error: err.message});
    }
};
export const getUser = async(req, res) =>{
    try{
        const user = await User.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        res.status(200).json(user);
    }catch(err){
      res.status(500).json({message: "Error in registering user", error: err.message});

    }
};