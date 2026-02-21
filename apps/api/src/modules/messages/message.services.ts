import pool from "../../config/db";

export async function createMessage(
  channelId: string,
  content: string,
  senderId: string
)
{
  const client = await pool.connect();

  try
  {
    await client.query("BEGIN");

    const channel = await client.query(
      `
      SELECT c.server_id, c.type
      FROM channels c
      WHERE c.id = $1
      `,
      [channelId]
    );
    if (channel.rowCount === 0)
      throw new Error("Channel not found");
    if (channel.rows[0].type !== "text")
      throw new Error("Cannot send message in this channel");
    const serverId = channel.rows[0].server_id;
    const membership = await client.query(
      `
      SELECT 1
      FROM server_members
      WHERE server_id = $1 AND user_id = $2
      `,
      [serverId, senderId]
    );
    if (membership.rowCount === 0)
      throw new Error("Unauthorized");
    const result = await client.query(
      `
      INSERT INTO messages (channel_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [channelId, senderId, content]
    );
    await client.query("COMMIT");
    return result.rows[0];
  }
  catch (err)
  {
    await client.query("ROLLBACK");
    throw err;
  }
  finally
  {
    client.release();
  }
}

export async function getMessage(channelId:string,userId:string,cursor?:string,limit:number=20){
  const client=await pool.connect();
  try{
    const channel=await client.query(`
      select server_id
      from channels
      where id=$1  
    `,[channelId]);
    if(channel.rowCount===0){
      throw new Error("Channel wasnt found sir");
    }
    const serverId=channel.rows[0].server_id;
    const membership=await client.query(`
      select 1 
      from server_members
      where server_id=$1 and user_id=$2  
    `,[serverId,userId])
    if(membership.rowCount===0){
      throw new Error("Unauthorize")
    }

    let query=`
      select * from
      messages
      where channel_id=$1    
    `;
    const values:any[]=[channelId];

    if(cursor){
      query+=`And created_at <$2`;
      values.push(cursor);
    }
    query+=`
      order by created_at desc
      limit ${limit}
    `

    const result=await client.query(query,values);
    return result.rows;
  }finally{
    client.release();
  }

}