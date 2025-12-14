import mongoose from "mongoose";

export const GenderEnum = {
    MALE :"MALE",
    FEMALE :"FEMALE",
};
export const providerEnum = {
    SYSTEM :"SYSTEM",
    GOOGLE :"GOOGLE",
};
export const roleEnum = {
    USER :"USER",
    ADMIN :"ADMIN",
}; 

const userSchema = new mongoose.Schema(
    {
    firstName: {
        type : String,
        required : true,
        trim : true,
        minLength:[2,"Firt Name must be at least 2 characters long"],
        maxLength:[20,"Firt Name must be at most 20 characters long"],
    },
    lastName: {
        type : String,
        required : true,
        trim : true,
        minLength:[2,"Last Name must be at least 2 characters long"],
        maxLength:[20,"Last Name must be at most 20 characters long"],
    },
    email: {
        type : String,
        required : true,
        trim : true,
        unique : true,
        lowercase : true,
    },
    password :{
        type : String,
        required : function(){
            return providerEnum.GOOGLE? false:true;
        },
    },
    gender :{
        type : String,
        enum:{
            values: Object.values(GenderEnum),

            message :"{VALUE} is not a valid gender",
        },
        default : GenderEnum.MALE,
    },
    providers :{
        type : String,
        enum:{
            values: Object.values(providerEnum),

            message :"{VALUE} is not a valid gender",
        },
        default : providerEnum.SYSTEM,
    },
    role :{
        type : String,
        enum:{
            values: Object.values(roleEnum),

            message :"{VALUE} is not a valid role",
        },
        default : roleEnum.USER,
    },
    phone : String,
    profileImages : String,
    coverImages : [String],
    CloudProfileImages : {public_id:String, secure_url:String},
    CloudCoverImages : [{public_id:String, secure_url:String}],  
    freezAd: Date,
    freezBy: {type: mongoose.Schema.Types.ObjectId,ref:"User"},
    restoreAd: Date,
    restoredBy: {type: mongoose.Schema.Types.ObjectId,ref:"User"},
    confirmEmail: Date,
    confirmEmailOTP: String,
    forgetPasswordOTP: String,
    },
    {
        timestamps : true,
        toJSON : {virtuals : true},
        toObject : {virtuals : true},
    }
);
userSchema.virtual("messages", {
    localField: "_id",
    foreignField: "receiverId",
    ref: "message",
   
});
const userModal = mongoose.models.User || mongoose.model("user" , userSchema);

export default userModal;


                          