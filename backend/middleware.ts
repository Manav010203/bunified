import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
export const authmiddleware = (req:Request,res:Response,next:NextFunction)=>{
    const token = req.headers.authorization;
    if(!token){
        res.status(401).json({
            "success":false,
            "error":"Unauthorized, token missing or invalid"
        })
        return;
    }
    try{
        const {userId,role} = jwt.verify(token,process.env.JWT_PASSWORD!) as JwtPayload;
        req.userId = userId;
        req.role = role;
        next();
    }catch(e){
        console.log(e);
        res.status(401).json({
            "success":false,
            "error":"Unauthorized, token missing or invalid"
        })
        return;
    }
}