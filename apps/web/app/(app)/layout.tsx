"use client"
import { useState,useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

export default function AppLayout({
  children
}:{children:React.ReactNode}){

  const router=useRouter();
  const [loading,setLoading]=useState<boolean>(true);
  const [authorized,setauthorized]=useState<boolean>(false);

  useEffect(()=>{
    async function checkSession(){
      try{
        await api.get('/auth/me');
        setauthorized(true);
      }catch{
        router.replace('/login')
      }finally{
        setLoading(false);
      }
      checkSession();
    }
  },[router]);
  if(loading){
    <div className="h-screen flex items-center justify-center">
      Checking session...
    </div>
  };
  if(!authorized){
    return null;
  }
  return <>{children}</>
}