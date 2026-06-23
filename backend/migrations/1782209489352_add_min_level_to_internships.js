exports.up = (pgm) => {
  pgm.addColumns('internships', {
    min_level: { type: 'integer', notNull: true, default: 1 },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('internships', ['min_level']);
};
