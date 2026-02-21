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