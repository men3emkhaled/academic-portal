exports.up = (pgm) => {
  pgm.createTable('internships', {
    id: { type: 'serial', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    company_name: { type: 'varchar(255)', notNull: true },
    company_logo_url: { type: 'text' },
    track_tag: { type: 'varchar(100)' },
    work_mode: { type: 'varchar(50)' },
    target_audience: { type: 'varchar(100)' },
    description: { type: 'text' },
    requirements: { type: 'text' },
    duration: { type: 'varchar(100)' },
    application_deadline: { type: 'date' },
    application_link: { type: 'text' },
    status: { type: 'varchar(20)', notNull: true, default: 'Open' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('internships');
};
