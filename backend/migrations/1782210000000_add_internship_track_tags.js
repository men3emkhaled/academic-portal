exports.up = (pgm) => {
  pgm.createTable('internship_track_tags', {
    id: { type: 'serial', primaryKey: true },
    internship_id: { type: 'integer', notNull: true, references: 'internships(id)', onDelete: 'cascade' },
    track_id: { type: 'integer', notNull: true, references: 'internship_tracks(id)', onDelete: 'cascade' },
  });
  pgm.addConstraint('internship_track_tags', 'unique_internship_track', {
    unique: ['internship_id', 'track_id']
  });

  pgm.sql(`
    INSERT INTO internship_track_tags (internship_id, track_id)
    SELECT i.id, t.id
    FROM internships i
    JOIN internship_tracks t ON i.track_tag = t.name
    WHERE i.track_tag IS NOT NULL
  `);

  pgm.dropColumn('internships', 'track_tag');
};

exports.down = (pgm) => {
  pgm.addColumns('internships', {
    track_tag: { type: 'varchar(100)' },
  });
  pgm.dropTable('internship_track_tags');
};
