import * as dbService from "../../DB/dbService.js";
import UserModel from "../../DB/models/user.model.js";
import MessageModel from "../../DB/models/message.model.js";
import { successResponse } from "../../Utils/successResponse.units.js";
import messageModel from "../../DB/models/message.model.js";

export const sendMessage = async (req, res, next) => {
    const { content } = req.body;
    const { receiverId } = req.params;

    const user = await dbService.findById({
        model: UserModel,
        id: receiverId
    });

    if (!user) {
        return next(new Error("Receiver not found", { cause: 404 }));
    }

    const message = await dbService.create({
        model: MessageModel,
        data: {
            content,
            receiverId: user._id,
        },
    });

    return successResponse(res, 201, "Message sent successfully", { message });
};

export const getMessage = async (req, res, next) => {

    const messages = await dbService.find({
        model: messageModel,
        populate: [{ path: "receiverId", select: "firstName lastName email gender _id" }],
    });

    return successResponse(res, 200, "Message fetched successfully", { messages });
};