import pool from "../../config/db";

export async function getMembers(serverId: string)
{
  const result = await pool.query(
    `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.avatar_url,
      sm.role,
      sm.joined_at
    FROM server_members sm
    JOIN users u ON u.id = sm.user_id
    WHERE sm.server_id = $1
    ORDER BY sm.joined_at ASC
    `,
    [serverId]
  );

  return result.rows;
}

export async function changeRole(
  serverId: string,
  targetUserId: string,
  newRole: string,
  requesterId: string
)
{
  const client = await pool.connect();

  try
  {
    await client.query("BEGIN");

    const requester = await client.query(
      `
      SELECT role
      FROM server_members
      WHERE server_id = $1 AND user_id = $2
      `,
      [serverId, requesterId]
    );

    if (requester.rowCount === 0)
      throw new Error("Not a server member");

    if (requester.rows[0].role !== "owner")
      throw new Error("Unauthorized");

    const target = await client.query(
      `
      SELECT role
      FROM server_members
      WHERE server_id = $1 AND user_id = $2
      `,
      [serverId, targetUserId]
    );

    if (target.rowCount === 0)
      throw new Error("Target not found");

    if (target.rows[0].role === "owner")
      throw new Error("Cannot change owner role");

    await client.query(
      `
      UPDATE server_members
      SET role = $1
      WHERE server_id = $2 AND user_id = $3
      `,
      [newRole, serverId, targetUserId]
    );

    await client.query("COMMIT");

    return { message: "Role updated" };
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

export async function kickMember(
  serverId: string,
  targetUserId: string,
  requesterId: string
)
{
  const client = await pool.connect();

  try
  {
    await client.query("BEGIN");

    const requester = await client.query(
      `
      SELECT role
      FROM server_members
      WHERE server_id = $1 AND user_id = $2
      `,
      [serverId, requesterId]
    );

    if (requester.rowCount === 0)
      throw new Error("Not a server member");

    if (requester.rows[0].role !== "owner")
      throw new Error("Unauthorized");

    const target = await client.query(
      `
      SELECT role
      FROM server_members
      WHERE server_id = $1 AND user_id = $2
      `,
      [serverId, targetUserId]
    );

    if (target.rowCount === 0)
      throw new Error("Target not found");

    if (target.rows[0].role === "owner")
      throw new Error("Cannot kick owner");

    await client.query(
      `
      DELETE FROM server_members
      WHERE server_id = $1 AND user_id = $2
      `,
      [serverId, targetUserId]
    );

    await client.query("COMMIT");

    return { message: "Member removed" };
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