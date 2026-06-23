const Internship = require('../models/Internship');

exports.getInternships = async (req, res) => {
  try {
    const { track, work_mode, status, search } = req.query;
    const internships = await Internship.getAll({ track, work_mode, status, search });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.getById(req.params.id);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    res.json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createInternship = async (req, res) => {
  try {
    const internship = await Internship.create(req.body);
    res.status(201).json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInternship = async (req, res) => {
  try {
    const internship = await Internship.update(req.params.id, req.body);
    if (!internship) return res.status(404).json({ message: 'Internship not found' });
    res.json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteInternship = async (req, res) => {
  try {
    const result = await Internship.delete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Internship not found' });
    res.json({ message: 'Internship deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
