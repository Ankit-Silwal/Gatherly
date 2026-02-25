"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type OTPFormProps={
  otp:string,
  onChange:(value:string)=>void
  maxLength?:number
}
export default function OTPForm({otp,onChange,maxLength=6}:OTPFormProps) {
  return (
    <Card className="w-full md:w-[350px]">
      <CardHeader>
        <CardTitle>Enter Verification Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputOTP maxLength={maxLength} value={otp} onChange={onChange}>
      <InputOTPGroup>
        {[...Array(maxLength)].map((_, i) => (
          <InputOTPSlot key={i} index={i} />
        ))}
      </InputOTPGroup>
    </InputOTP>
        <p className="text-muted-foreground text-sm">
          You will be automatically redirected after the code is confirmed.
        </p>
      </CardContent>
    </Card>
  );
}
