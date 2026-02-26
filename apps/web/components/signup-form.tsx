"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import api from "@/lib/api"
export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [email,setEmail]=useState<string>("");
  const [password,setPassword]=useState<string>("");
  const [conformPassword,setConformPassword]=useState<string>("");
  const [username,setUsername]=useState<string>("");
  const [error,setError]=useState<string>("");
  const [success,setSuccess]=useState<string>("");
  const [loading,setLoading]=useState<boolean>(false);
  const router=useRouter();
  const handleRegister=async (e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(loading) return;
    setError("");
    setSuccess("");
    if(password!=conformPassword){
      setError("Password didn't match sir");
      return;
    }
    try{
      setLoading(true);
      const res=await api.post('/auth/register',{
        username,
        email,
        password,
        conformPassword
      })
      if(res.status===200){
        setSuccess("Registration Successful");
        router.push(`/signup/verify-otp?token=${encodeURIComponent(res.data.token)}`)
      }else{
        setError(res.data.message);
      }
    }catch(err){
      if (err) {
        setError(`Unexpected Error ${err}`);
      } else {
        console.log("Registration Error:", err);
        setError(`Unexpected Error ${err}`);
      }
    }finally{
      setLoading(false);
    }
  }
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Username</FieldLabel>
              <Input id="name" type="text" placeholder="johndoe" required onChange={(e)=>{
                setUsername(e.target.value);
              }}/>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={(e)=>{
                  setEmail(e.target.value);
                }}
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" required 
              onChange={(e)=>{
                setPassword(e.target.value);
              }}/>
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" type="password" required 
              onChange={(e)=>{
                setConformPassword(e.target.value);
              }}/>
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
            <FieldGroup>
              <Field>
                <Button type="submit">Create Account</Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a className="cursor-pointer underline hover:text-blue-600">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
