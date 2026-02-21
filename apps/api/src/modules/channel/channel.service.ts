import pool from "../../config/db";
export async function createChannel(serverId:string,name:string,type:string) {
  const client=await pool.connect();
  try{
    const channel=await client.query(`
      insert into channels (server_id,name,type)
      values ($1,$2,$3) 
    `,[serverId,name,type])
    client.query("COMMIT");
  }catch(error){
    client.query("ROLLBACK");
    throw new Error(`${error}`);
  }finally{
    client.release();
  }
}