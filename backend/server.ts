import express from "express";
import { LoginSchema, SignupSchema } from "./types";
import { UserModel } from "./model";
import { authmiddleware } from "./middleware";
import jwt from "jsonwebtoken";
const app = express();
const port = 3000;
app.use(express.json());
app.post("/auth/signup",async(req,res)=>{
    const {success,data} = SignupSchema.safeParse(req.body);
    if(!success){
        res.status(401).json({
            "success":false,
            "error":"wrong schema provided"
        })
        return;
    }
    const user = await UserModel.findOne({
        email:data.email
    })


    if(user){
        res.status(400).json({
            "success":false,
            "error":"Email already existed"
        })
        return;
    }
    const newUser = await UserModel.create({
        email:data.email,
        password:data.password,
        name:data.name,
        role:data.role
    })
    res.status(201).json({
        "success":true,
        data:{
            _id:newUser._id,
            name:newUser.name,
            email:newUser.email,
            role:newUser.role,
        }
    })
})
app.post("/auth/login",authmiddleware,async(req,res)=>{
    const {success,data} = LoginSchema.safeParse(req.body);
    if(!success){
        res.status(401).json({
            "success":false,
            "error":"schema provided is not good"
        })
        return;
    }
    const user = await UserModel.findOne({
        email:data.email
    })
    if(!user || user.password != data.password){
        res.status(401).json({
            "success":false,
            "error":"User not found"
        })
        return;
    }
    const token = jwt.sign({
        role:user.role,
        userId:user._id
    },process.env.JWT_PASSWORD!);
    res.status(200).json({
        "success":true,
        data:{
            "token":token
        }
    })
})
app.listen(port);