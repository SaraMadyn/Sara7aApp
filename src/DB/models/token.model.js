import mongoose from "mongoose";


const tokenSchema = new mongoose.Schema(
    {
        jwtId : {
            type : String,
            required : true,
            unique : true,
        },
        expiresIn : {
            type : Date,
            required : true,
        },
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : true,
        },

    },
    {
        timestamps : true,
    }
);
const tokenModal = mongoose.models.token || mongoose.model("token" , tokenSchema);

export default tokenModal;

                     