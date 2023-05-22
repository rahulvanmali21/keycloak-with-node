import { NextFunction, Request, Response } from "express";
import { verifyJWTOffline } from "../keycloak-client";


export interface AuthenticateRequest extends Request {
    userInfo: any,
  }

export const keycloakProtect =async(request:any,response:any,next:any)=>{
    if(!request.headers.authorization){
        return response.status(400).json({message:"access_token required"});
    }
    const token = request.headers.authorization.split(" ").at(-1) ?? "";
    try {
    const userInfo = await verifyJWTOffline(token)
    request.userInfo = userInfo;
    return next()
        
    } catch (error:any) {
        if(error.name==="TokenExpiredError"){
            return response.status(401).json({message:"access_token invalidss"});
        }
        return  response.status(403).json({message:"access_token invalid"});
    }

}