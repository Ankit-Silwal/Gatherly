import pool from "../../config/db";

export async function createChannel(
  serverId: string,
  name: string,
  type: string,
  requesterId: string
)
{
  const client = await pool.connect();

  try
  {
    await client.query("BEGIN");

    const membership = await client.query(
      `
      SELECT role
      FROM server_members
      WHERE server_id = $1 AND user_id = $2
      `,
      [serverId, requesterId]
    );

    if (membership.rowCount === 0)
      throw new Error("Not a member");

    const role = membership.rows[0].role;

    if (role !== "owner" && role !== "moderator")
      throw new Error("Unauthorized");

    const result = await client.query(
      `
      INSERT INTO channels (server_id, name, type)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [serverId, name, type]
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

export async function getChannels(
  serverId: string,
  requesterId: string
)
{
  const membership = await pool.query(
    `
    SELECT 1
    FROM server_members
    WHERE server_id = $1 AND user_id = $2
    `,
    [serverId, requesterId]
  );

  if (membership.rowCount === 0)
    throw new Error("Unauthorized");

  const result = await pool.query(
    `
    SELECT *
    FROM channels
    WHERE server_id = $1
    ORDER BY position ASC, created_at ASC
    `,
    [serverId]
  );

  return result.rows;
}

export async function renameChannel(
  channelId: string,
  newName: string,
  requesterId: string
)
{
  const client = await pool.connect();

  try
  {
    await client.query("BEGIN");

    const channel = await client.query(
      `
      SELECT server_id
      FROM channels
      WHERE id = $1
      `,
      [channelId]
    );

    if (channel.rowCount === 0)
      throw new Error("Channel not found");

    const serverId = channel.rows[0].server_id;

    const membership = await client.query(
      `
      SELECT role
      FROM server_members
      WHERE server_id = $1 AND user_id = $2
      `,
      [serverId, requesterId]
    );

    if (membership.rowCount === 0)
      throw new Error("Unauthorized");

    const role = membership.rows[0].role;

    if (role !== "owner" && role !== "moderator")
      throw new Error("Unauthorized");

    await client.query(
      `
      UPDATE channels
      SET name = $1
      WHERE id = $2
      `,
      [newName, channelId]
    );

    await client.query("COMMIT");

    return { message: "Channel renamed" };
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

export async function deleteChannel(
  channelId: string,
  requesterId: string
)
{
  const client = await pool.connect();

  try
  {
    await client.query("BEGIN");

    const channel = await client.query(
      `
      SELECT server_id
      FROM channels
      WHERE id = $1
      `,
      [channelId]
    );

    if (channel.rowCount === 0)
      throw new Error("Channel not found");

    const serverId = channel.rows[0].server_id;

    const membership = await client.query(
      `
      SELECT role
      FROM server_members
      WHERE server_id = $1 AND user_id = $2
      `,
      [serverId, requesterId]
    );

    if (membership.rowCount === 0)
      throw new Error("Unauthorized");

    if (membership.rows[0].role !== "owner")
      throw new Error("Only owner can delete channel");

    await client.query(
      `
      DELETE FROM channels
      WHERE id = $1
      `,
      [channelId]
    );

    await client.query("COMMIT");

    return { message: "Channel deleted" };
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