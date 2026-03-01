import pool from '../../config/db';
import logger from '../../utils/logger';

export async function createMessage(channelId: string, content: string, senderId: string) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const channel = await client.query(
      `
      SELECT c.server_id, c.type
      FROM channels c
      WHERE c.id = $1
      `,
      [channelId]
    );
    if (channel.rowCount === 0) throw new Error('Channel not found');
    if (channel.rows[0].type !== 'text') throw new Error('Cannot send message in this channel');
    const serverId = channel.rows[0].server_id;
    const membership = await client.query(
      `
      SELECT 1
      FROM server_members
      WHERE server_id = $1 AND user_id = $2
      `,
      [serverId, senderId]
    );
    if (membership.rowCount === 0) throw new Error('Unauthorized');
    const result = await client.query(
      `
      INSERT INTO messages (channel_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [channelId, senderId, content]
    );
    logger.info('Message created', {
      userId: senderId,
      channelId,
      messageId: result.rows[0].id,
    });
    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getMessage(
  channelId: string,
  userId: string,
  cursor?: string,
  limit: number = 20
) {
  const client = await pool.connect();
  try {
    const channel = await client.query(
      `
      select server_id
      from channels
      where id=$1  
    `,
      [channelId]
    );
    if (channel.rowCount === 0) {
      throw new Error("Channel wasn't found sir");
    }
    const serverId = channel.rows[0].server_id;
    const membership = await client.query(
      `
      select 1 
      from server_members
      where server_id=$1 and user_id=$2  
    `,
      [serverId, userId]
    );
    if (membership.rowCount === 0) {
      throw new Error('Unauthorize');
    }

    let query = `
        select m.*, u.username from
        messages m
        join users u on m.sender_id = u.id
        where m.channel_id = $1
      `;
    const values: any[] = [channelId];

    if (cursor) {
      query += ` and m.created_at < $2`;
      values.push(cursor);
    }
    query += `
      order by created_at desc
      limit ${limit}
    `;

    const result = await client.query(query, values);
    return result.rows.reverse();
  } finally {
    client.release();
  }
}

export async function editMessage(messageId: string, newContent: string, userId: string) {
  const client = await pool.connect();
  try {
    await pool.query('BEGIN');
    const message = await client.query(
      `
      SELECT m.channel_id, m.sender_id, c.server_id
      FROM messages m
      JOIN channels c ON c.id = m.channel_id
      WHERE m.id = $1
      `,
      [messageId]
    );
    if (message.rowCount === 0) {
      throw new Error('Unauthorized');
    }
    const { sender_id, server_id } = message.rows[0];
    if (sender_id !== userId) {
      throw new Error('Unauthorized');
    }
    const membership = await client.query(
      `
    select 1
    from member_servers
    where server_id=$1 and user_id=$2
    `,
      [server_id, userId]
    );
    if (membership.rowCount === 0) {
      throw new Error('Unauthorized');
    }
    const updated = await client.query(
      `
        UPDATE messages
      SET content = $1,
          updated_at = NOW(),
          is_edited = TRUE
      WHERE id = $2
      RETURNING *
    `,
      [newContent, messageId]
    );
    await client.query('COMMIT');
    return updated.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteMessage(messageId: string, userId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const message = await client.query(
      `
      select m.channel_id,m.sender_id,c.server_id
      from messages m
      join channels c on c.id=m.channel_id
      where m.id=$1  
    `,
      [messageId]
    );
    if (message.rowCount === 0) {
      throw new Error("The message wasn't found sir");
    }
    const { channel_id, sender_id, server_id } = message.rows[0];
    const membership = await client.query(
      `
      select role 
      from server_members
      where server_id=$1 and user_id=$2
    `,
      [server_id, userId]
    );
    if (membership.rowCount === 0) {
      logger.warn('Unauthorized attempt', {
        userId,
        action: 'delete_message',
        messageId,
      });
      throw new Error('Unauthorized');
    }
    const role = membership.rows[0];
    const isSender = sender_id === userId;
    const isOwner = role === 'owner';
    const isModerator = role === 'moderator';

    if (!isSender && !isOwner && !isModerator) {
      logger.warn('Unauthorized attempt', {
        userId,
        action: 'delete_message',
        messageId,
      });
      throw new Error('Unauthorized');
    }

    await client.query(
      `
      delete from messages
      where id=$1  
    `,
      [messageId]
    );
    await client.query(
      `
      INSERT INTO server_audit_logs
      (server_id, action_type, performed_by, target_id, metadata)
      VALUES ($1, 'message_delete', $2, $3, $4)
      `,
      [server_id, userId, messageId, JSON.stringify({ channelId: channel_id })]
    );
    await client.query('COMMIT');
    logger.warn('Message deleted', {
      userId,
      messageId,
      serverId: server_id,
    });
    return {
      messageId,
      channel_id,
    };
  } catch (err: any) {
    await client.query('ROLLBACK');
    logger.error('Database transaction failed', {
      error: err.message,
    });
    throw err;
  } finally {
    client.release();
  }
}

export async function markChannelRead(channelId: string, messageId: string, userId: string) {
  await pool.query(
    `
    INSERT INTO channel_reads
    (channel_id, user_id, last_read_message_id, last_read_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (channel_id, user_id)
    DO UPDATE SET
      last_read_message_id = $3,
      last_read_at = NOW()
    `,
    [channelId, userId, messageId]
  );
}
