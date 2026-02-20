import pool from "../../config/db";
import { randomBytes } from "node:crypto";

export async function createServer(name:string,description:string,ownerId:string){
  const inviteCode=randomBytes(6).toString("hex");
  const client=await pool.connect();
  try{
    await client.query("BEGIN");
    const serverResult=await client.query(
      `
      insert into servers (name,description,owner_id,invite_code) 
      values ($1,$2,$3,$4)
      returning *;     
      `,[name,description,ownerId,inviteCode]
    )

    const server=serverResult.rows[0];
    
    await client.query(`
      insert into server_members (server_id,user_id,role)
      values ($1,$2,'owner')
      `,[server.id,ownerId])
    await client.query("COMMIT");
    return server;
  }catch(error){
    await client.query("ROLLBACK");
    throw error;
  }finally{
    client.release()
  }

}