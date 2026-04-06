"use client"
import { LoginForm } from "@/components/login-form"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
export default function Page() {
  const router = useRouter()
  useEffect(() => {
    async function checkSession() {
      try {
        await api.get("/auth/me");
        router.replace("/servers");
      }
      catch {
      }
    }

    checkSession();
  }, [router]);
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
