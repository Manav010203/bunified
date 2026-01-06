import mongoose from "mongoose";
import app from ".";
import { connectDB } from "./db";


await connectDB();
console.log("Connecting to:", process.env.MONGO_URL);


app.listen(3000,()=>{
    console.log(`listenning on port 3000`);
})