import mongoose, { Schema } from "mongoose";
export const userSchema = new mongoose.Schema(
    {
        password: {
          type: String,
          required: [true, 'Set password for user'],
        },
        email: {
          type: String,
          required: [true, 'Email is required'],
          index:true,
          unique: true,
        },
        subscription: {
          type: String,
          enum: ["starter", "pro", "business"],
          default: "starter"
        },
        
        token: {type:String,
            default:null,
      },
      avatarURL:{
        type:String,
        required:true,
      }
      },
      { versionKey: false,
       }
)
export const User = mongoose.model("User", userSchema)