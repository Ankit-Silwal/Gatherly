import { randomBytes } from "node:crypto";
export function generateToken():string{
  const token=randomBytes(6).toString("hex");
  return token;
}