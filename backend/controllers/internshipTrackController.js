const InternshipTrack = require('../models/InternshipTrack');

exports.getTracks = async (req, res) => {
  try {
    const tracks = await InternshipTrack.getAll();
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTrack = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Track name is required' });
    const track = await InternshipTrack.create(name.trim());
    if (!track) return res.status(409).json({ message: 'Track already exists' });
    res.status(201).json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTrack = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Track name is required' });
    const track = await InternshipTrack.update(req.params.id, name.trim());
    if (!track) return res.status(404).json({ message: 'Track not found' });
    res.json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTrack = async (req, res) => {
  try {
    const result = await InternshipTrack.delete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Track not found' });
    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.seedTracks = async (req, res) => {
  try {
    const created = await InternshipTrack.seed();
    res.status(201).json({ message: 'Tracks seeded', count: created.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
