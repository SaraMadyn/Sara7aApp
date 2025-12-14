import UserModel, { roleEnum } from "../../DB/models/user.model.js";
import { successResponse } from "../../Utils/successResponse.units.js";
import * as dbService from "../../DB/dbService.js";
import { asymmetricDcrypt, decrypt } from "../../Utils/encryption/encryption.units.js";
import { verifyToken } from "../../Utils/tokens/token.utils.js";
import TokenModel from "../../DB/models/token.model.js";
import { findByIdAndUpdate } from "../../DB/dbService.js"; 
import  {cloudinaryConfig} from "../../Utils/multer/cloudinary.config.js"




export const listAllUsers = async (req, res, next) => {
  let users = await dbService.find({
    model: UserModel,
    populate : [{path : "messages", select : "content _id -receiverId"}]
  });



  return successResponse(res, 200, "User fetched successfully", { users });
};

export const updateProfile = async (req, res, next) => {
  const {firstName, lastName, gender} = req.body;

  const user= await dbService.findByIdAndUpdate({model: UserModel, id: req.user._id, data: {firstName, lastName, gender, $inc: {__v: 1}},}); 


  return successResponse(res, 200, "User Updated successfully", { user });
}; 
export const profileImg = async (req, res, next) => {

  const {public_id, secure_url} = await cloudinaryConfig().uploader.upload(req.file.path,{
    folder:`Sara7aApp/Users/${req.user._id}`
  })
  const user = await dbService.findByIdAndUpdate({model: UserModel, id: req.user._id, data: {CloudProfileImages: {public_id , secure_url}},}); 
  if(req.user.CloudProfileImages?.public_id){
    await cloudinaryConfig().uploader.destroy(req.user.CloudProfileImages.public_id)
  }
  
  return successResponse(res, 200, "Profile image uploaded successfully", { user });
}; 

export const coverImages = async (req, res, next) => {
  const attachments = [];

  const CLOUD_FOLDER = `Sara7aApp/Users/${req.user._id}`;
  const MAX_FILES = 4;

  if (req.files.length > MAX_FILES) {
    return res.status(400).json({
      message: `You can upload maximum ${MAX_FILES} images`,
    });
  }

  if (req.user.CloudCoverImages?.length) {
    for (const oldImg of req.user.CloudCoverImages) {
      if (oldImg.public_id) {
        await cloudinaryConfig().uploader.destroy(oldImg.public_id);
      }
    }
  }

  for (const file of req.files) {
    const { public_id, secure_url } = await cloudinaryConfig().uploader.upload(
      file.path,
      { folder: CLOUD_FOLDER }
    );

    attachments.push({ public_id, secure_url });
  }

  const user = await dbService.findByIdAndUpdate({
    model: UserModel,
    id: req.user._id,
    data: { CloudCoverImages: attachments },
  });

  return successResponse(res, 200, "Cover images uploaded successfully", { user });
};

export const freezeAccount = async (req, res, next) => {
  try {
    const userId = req.user?._id; 

    if (!userId) {
      return next(new Error("User ID not found in token"));
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { isFrozen: true },
      { new: true }
    );

    return res.json({
      message: "Account frozen successfully",
      user,
    });

  } catch (error) {
    next(error);
  }
};



export const restoreAccount = async(req,res,next) =>{
  const {userId} = req.params;
  const updatedUser = await dbService.findByIdAndUpdate({
    model: UserModel, 
    filter: {
      _id: userId , freezAd:{$exists: true}, freezBy:{$exists: true}
    }, 
    data: {
      $unset:{
        freezAd:true, 
        freezBy: true
      },
      restoreAd: Date.now(), 
      restoredBy: req.user._id
    }});
  return updatedUser ? successResponse(res, 200, "User restored successfully", { updatedUser }) : next(new Error("User not found"));

};