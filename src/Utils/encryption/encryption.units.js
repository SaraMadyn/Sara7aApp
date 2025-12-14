import crypto from "node:crypto";
import fs from "node:fs";

const SECRET_KEY = Buffer.from("12345678901234567890123456789012");
const IV_LENGTH = Number(process.env.IV_LENGTH);


export const encrypt = (plainText) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_SECRET_KEY, iv);
  let encrypted = cipher.update(plainText, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encryptedData) => {
    const [ivHex, cipherText ] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_SECRET_KEY, iv);
    let decrypted = decipher.update(cipherText, "hex", "utf-8");
    decrypted += decipher.final("utf-8");
    return decrypted;


};

if (fs.existsSync("publicKey.pem") && fs.existsSync("privateKey.pem")){
  console.log("Keys already exist");
}else{
  const{publicKey,privateKey}=crypto.generateKeyPairSync("rsa",{modulusLength: 2048,publicKeyEncoding:{type:"pkcs1",format:"pem"},privateKeyEncoding:{type:"pkcs1",format:"pem"}})
  fs.writeFileSync("publicKey.pem",publicKey)
  fs.writeFileSync("privateKey.pem",privateKey)
}

export const asymmetricEncrypt = (plainText) => {
  const bufferText= Buffer.from(plainText,"utf-8");
  const encryptedData= crypto.publicEncrypt({key:fs.readFileSync("publicKey.pem","utf8"), padding:crypto.constants.RSA_PKCS1_OAEP_PADDING},bufferText);
  return encryptedData.toString("hex");
};

export const asymmetricDcrypt = (cipherText) => {
  const buffercipherText= Buffer.from(cipherText,"hex");
  const decryptedData= crypto.privateDecrypt({key:fs.readFileSync("privateKey.pem","utf8"), padding:crypto.constants.RSA_PKCS1_OAEP_PADDING},buffercipherText);
  return decryptedData.toString("utf-8");
};