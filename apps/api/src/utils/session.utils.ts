import REDIS_CLIENT from "../config/redis";

export async function getUserSession(sessionId:string):Promise<string | null> {
  const rawSession=await REDIS_CLIENT.get(`session:${sessionId}`)

  if(!sessionId){
    return null;
  }

  if(!rawSession){
    return null;
  }

  const sessionData=JSON.parse(rawSession) as {userId:string};
  if(!sessionData.userId){
    return null;
  }
  return sessionData.userId;
}