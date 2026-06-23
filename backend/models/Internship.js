const db = require('../config/database');

const TRACKS_FRAGMENT = `COALESCE(
  json_agg(json_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL),
  '[]'::json
)`;

class Internship {
  static async getAll(filters = {}) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters.track) {
      conditions.push(`i.id IN (SELECT itt.internship_id FROM internship_track_tags itt JOIN internship_tracks t ON itt.track_id = t.id WHERE t.name = $${idx++})`);
      values.push(filters.track);
    }

    if (filters.work_mode) {
      conditions.push(`i.work_mode = $${idx++}`);
      values.push(filters.work_mode);
    }

    if (filters.status) {
      conditions.push(`i.status = $${idx++}`);
      values.push(filters.status);
    }

    if (filters.search) {
      conditions.push(`(i.title ILIKE $${idx} OR i.company_name ILIKE $${idx})`);
      idx++;
      values.push(`%${filters.search}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db.query(
      `SELECT i.*, ${TRACKS_FRAGMENT} as tracks
       FROM internships i
       LEFT JOIN internship_track_tags itt ON i.id = itt.internship_id
       LEFT JOIN internship_tracks t ON itt.track_id = t.id
       ${where}
       GROUP BY i.id
       ORDER BY i.created_at DESC`,
      values
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query(
      `SELECT i.*, ${TRACKS_FRAGMENT} as tracks
       FROM internships i
       LEFT JOIN internship_track_tags itt ON i.id = itt.internship_id
       LEFT JOIN internship_tracks t ON itt.track_id = t.id
       WHERE i.id = $1
       GROUP BY i.id`,
      [id]
    );
    return result.rows[0];
  }

  static async create(data) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `INSERT INTO internships (title, company_name, company_logo_url, work_mode,
          description, requirements, duration, application_deadline, application_link, status, min_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [data.title, data.company_name, data.company_logo_url || null,
         data.work_mode || null, data.description || null,
         data.requirements || null, data.duration || null, data.application_deadline || null,
         data.application_link || null, data.status || 'Open', data.min_level || 1]
      );
      const internshipId = result.rows[0].id;

      const trackIds = data.track_ids || [];
      for (const trackId of trackIds) {
        await client.query(
          'INSERT INTO internship_track_tags (internship_id, track_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [internshipId, trackId]
        );
      }

      await client.query('COMMIT');
      return this.getById(internshipId);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    const fieldMap = {
      title: 'title', company_name: 'company_name', company_logo_url: 'company_logo_url',
      work_mode: 'work_mode',
      description: 'description', requirements: 'requirements', duration: 'duration',
      application_deadline: 'application_deadline', application_link: 'application_link', status: 'status',
      min_level: 'min_level'
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        values.push(data[key]);
      }
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      if (fields.length > 0) {
        fields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);
        await client.query(
          `UPDATE internships SET ${fields.join(', ')} WHERE id = $${idx}`,
          values
        );
      }

      if (data.track_ids !== undefined) {
        await client.query('DELETE FROM internship_track_tags WHERE internship_id = $1', [id]);
        for (const trackId of data.track_ids) {
          await client.query(
            'INSERT INTO internship_track_tags (internship_id, track_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, trackId]
          );
        }
      }

      await client.query('COMMIT');
      return this.getById(id);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM internships WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

module.exports = Internship;
