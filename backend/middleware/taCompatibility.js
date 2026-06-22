const taCompatibility = (req, res, next) => {
  if (req.ta) {
    req.doctor = {
      id: req.ta.id,
      name: req.ta.name,
      email: req.ta.email,
    };
  }
  next();
};

module.exports = { taCompatibility };
