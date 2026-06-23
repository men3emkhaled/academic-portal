const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const internshipTrackController = require('../controllers/internshipTrackController');

router.get('/', internshipController.getInternships);
router.get('/tracks', internshipTrackController.getTracks);
router.get('/:id', internshipController.getInternshipById);

router.post('/seed', async (req, res) => {
  try {
    const Internship = require('../models/Internship');
    const ITrack = require('../models/InternshipTrack');
    await ITrack.seed();
    const allTracks = await ITrack.getAll();
    const trackMap = {};
    allTracks.forEach(t => { trackMap[t.name] = t.id; });
    const sample = [
      { title: 'Software Engineering Intern', company_name: 'Google', company_logo_url: 'https://logo.clearbit.com/google.com', work_mode: 'Online + Offline', description: 'Join Google as a software engineering intern and work on real-world projects that impact billions of users.', requirements: 'Strong CS fundamentals, proficiency in Java/Python/C++, problem-solving skills.', duration: '3 months', application_deadline: '2026-09-15', application_link: 'https://careers.google.com/internships', status: 'Open', min_level: 3, track_ids: [trackMap['Computer Science'], trackMap['Software Engineering']] },
      { title: 'Data Science Intern', company_name: 'Microsoft', company_logo_url: 'https://logo.clearbit.com/microsoft.com', work_mode: 'Online', description: 'Work with Microsoft data scientists to build ML models and analyze large datasets.', requirements: 'Python, SQL, machine learning basics, statistics.', duration: '6 months', application_deadline: '2026-10-01', application_link: 'https://careers.microsoft.com', status: 'Open', min_level: 2, track_ids: [trackMap['Data Science']] },
      { title: 'Frontend Developer Intern', company_name: 'Meta', company_logo_url: 'https://logo.clearbit.com/meta.com', work_mode: 'Offline', description: 'Build user interfaces for Meta products used by billions.', requirements: 'React, TypeScript, CSS, understanding of web performance.', duration: '4 months', application_deadline: '2026-08-30', application_link: 'https://metacareers.com', status: 'Upcoming', min_level: 2, track_ids: [trackMap['Web Development'], trackMap['UI/UX Design']] },
      { title: 'AI Research Intern', company_name: 'OpenAI', company_logo_url: 'https://logo.clearbit.com/openai.com', work_mode: 'Online', description: 'Conduct cutting-edge AI research alongside world-class researchers.', requirements: 'ML research experience, publications preferred, strong math background.', duration: '6 months', application_deadline: '2026-11-01', application_link: 'https://openai.com/careers', status: 'Open', min_level: 3, track_ids: [trackMap['Artificial Intelligence'], trackMap['Machine Learning']] },
      { title: 'Cybersecurity Intern', company_name: 'Cisco', company_logo_url: 'https://logo.clearbit.com/cisco.com', work_mode: 'Online + Offline', description: 'Protect Cisco infrastructure and products from emerging security threats.', requirements: 'Network security knowledge, Python, Linux, security certifications a plus.', duration: '3 months', application_deadline: '2026-07-15', application_link: 'https://jobs.cisco.com', status: 'Closed', min_level: 2, track_ids: [trackMap['Cybersecurity']] },
    ];
    for (const data of sample) {
      await Internship.create(data);
    }
    res.status(201).json({ message: 'Tracks and internships seeded', count: { internships: sample.length } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
