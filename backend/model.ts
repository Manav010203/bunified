import * as mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name:String,
        email:{type:String,unique:true},
        password:String,
        role:String,
    }
)
const ClassSchema = new mongoose.Schema({
    className:String,
    teacherId:{
        type:mongoose.Types.ObjectId,
        ref : "Users"
    },
    studentId : [{
        type:mongoose.Types.ObjectId,
        ref : "Users"
    }],
    // createdAt:Date
})
export const UserModel = mongoose.model("Users",UserSchema);
export const ClassModel = mongoose.model("Classes",ClassSchema);