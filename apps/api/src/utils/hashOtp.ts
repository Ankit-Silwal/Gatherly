import crypto from "crypto";
export function hashOtp(otp:string){
  return crypto.createHash("sha256").update(otp).digest("hex");
}