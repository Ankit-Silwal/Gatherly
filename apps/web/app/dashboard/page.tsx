"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
export default function Dashboard()
{
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() =>
  {
    async function checkSession()
    {
      try
      {
        const res = await api.get("/auth/me");
        setUsername(res.data.user.username);
      }
      catch
      {
        router.push("/login");
      }
      finally
      {
        setLoading(false);
      }
    }

    checkSession();
  }, [router]);

  if (loading)
    return <div>Loading...</div>;

  return (
    <div className="h-screen flex items-center justify-center text-2xl">
      Logged in as {username}
    </div>
  );
}