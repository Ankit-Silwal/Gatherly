"use client"

import OTPForm from "@/components/authentication-05"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/api"
export default function Page()
{
  const [otp, setOtp] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  useEffect(() =>
  {
    if (!email )
    {
      router.replace("/signup")
      return
    }
  }, [email])
  useEffect(() =>
  {
    if (otp.length === 6 && email && !loading)
    {
      verifyOtp()
    }
  }, [otp]) 
  const verifyOtp = async () =>
  {
    try
    {
      setLoading(true)
      setError("")
      setSuccess("")
      const res = await api.post("/auth/verify", {
        email,
        otp
      })

      if (res.status === 200)
      {
        setSuccess("Verification successful. Redirecting...")
        
        setTimeout(() =>
        {
          router.push("/login")
        }, 1500)
      }
    }
    catch (err: unknown)
    {
      setError("Network or server error")
    } finally
    {
      setLoading(false)
    }
  }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-3">
        <OTPForm otp={otp} onChange={setOtp} />
        {loading && (
          <p className="text-sm text-muted-foreground">
            Verifying...
          </p>
        )}
        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-500">
            {success}
          </p>
        )}
      </div>
    </div>
  )
}