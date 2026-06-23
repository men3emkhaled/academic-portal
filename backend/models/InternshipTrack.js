const db = require('../config/database');

class InternshipTrack {
  static async getAll() {
    const result = await db.query('SELECT * FROM internship_tracks ORDER BY name ASC');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM internship_tracks WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(name) {
    const result = await db.query(
      'INSERT INTO internship_tracks (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *',
      [name]
    );
    return result.rows[0];
  }

  static async update(id, name) {
    const result = await db.query(
      'UPDATE internship_tracks SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query('DELETE FROM internship_tracks WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async seed() {
    const defaults = [
      'Computer Science', 'Software Engineering', 'Data Science',
      'Web Development', 'Mobile Development', 'Artificial Intelligence',
      'Machine Learning', 'Deep Learning', 'Cybersecurity',
      'Cloud Computing', 'DevOps', 'Database Administration',
      'Network Engineering', 'UI/UX Design', 'Game Development',
      'Embedded Systems', 'Information Technology', 'Business Intelligence',
      'Blockchain', 'IoT', 'Computer Vision',
      'Natural Language Processing', 'Robotics', 'Systems Administration',
      'Quality Assurance', 'Technical Writing',
    ];
    const created = [];
    for (const name of defaults) {
      const track = await InternshipTrack.create(name);
      if (track) created.push(track);
    }
    return created;
  }
}

module.exports = InternshipTrack;
