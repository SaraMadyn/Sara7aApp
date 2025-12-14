import { EventEmitter } from "node:events";
import { template } from "../emails/generateHTML.js";
import { sendEmail } from "../emails/email.utils.js";
import { emailSubject } from "../emails/email.utils.js";

export const eventEmitter = new EventEmitter();

eventEmitter.on("confirmEmail", async (data) => {
    await sendEmail({
        to: data.to,
        subject: emailSubject.confirmEmail,
        html: template(data.otp, data.firstName),
    }).catch((err) => {
        console.log(`error sending email: ${err}`);
    })
    
})

eventEmitter.on("forgetPassword", async (data) => {
    await sendEmail({
        to: data.to,
        subject: emailSubject.forgetPassword,
        html: template(data.otp, data.firstName, emailSubject.forgetPassword),
    }).catch((err) => {
        console.log(`error sending email: ${err}`);
    })
    
})
