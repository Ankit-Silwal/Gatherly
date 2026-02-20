import { error } from "node:console";
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

export async function joinServer(inviteCode:string,userId:string){
  const client=await pool.connect()
  try{
    client.query("BEGIN");
    const serverResult=await client.query(`
    select * from servers where invite_code=$1
    `,[inviteCode])
    if (serverResult.rowCount === 0)
    {
      throw new Error("Invalid invite code");
    }
    const server=serverResult.rows[0];

    await client.query(`
      insert into server_members (server_id,user_id)
      values ($1,$2)
      on conflict (server_id,user_id) do nothing
      `,[server.id,userId])
      await client.query("COMMIT");
      return server
  }catch(error){
    await client.query("ROLLBACK");
    throw error;
  }finally{
    client.release()
  }
}

export async function getAllServers(userId:string){
  const client=await pool.connect();
  try{
    client.query("BEGIN");
    const result=await client.query(`
      SELECT 
      s.id,
      s.name,
      FROM server_members sm
      JOIN servers s ON sm.server_id = s.id
      WHERE sm.user_id = $1
      ORDER BY s.created_at DESC;
      `,[userId])
    await client.query("COMMIT")
    return result.rows;
  }catch(error){
    await client.query("ROLLBACK");
    throw error;
  }finally{
    client.release();
  }
}

export async function getServerDetials(serverId:string){
  const client=await pool.connect();
  try{
    client.query("BEGIN");
    const count=await client.query(`
      SELECT COUNT(*) AS member_count
      FROM server_members
      WHERE server_id = $1;
      `,[serverId])
      await client.query("COMMIT");
      return count;
  }catch(error){
    throw error;
  }finally{
    client.release();
  }
}