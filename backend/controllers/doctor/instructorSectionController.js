const db = require('../../config/database');

const getCourseInstructorSections = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await db.query(`
      SELECT cis.*,
        CASE WHEN cis.instructor_type = 'doctor' THEN d.name
             WHEN cis.instructor_type = 'ta' THEN ta.name
        END as instructor_name
      FROM course_instructor_sections cis
      LEFT JOIN doctors d ON cis.instructor_type = 'doctor' AND cis.instructor_id = d.id
      LEFT JOIN teaching_assistants ta ON cis.instructor_type = 'ta' AND cis.instructor_id = ta.id
      WHERE cis.course_id = $1
      ORDER BY cis.section
    `, [courseId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInstructorSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { instructor_type, instructor_id, section } = req.body;
    if (!instructor_type || !instructor_id || !section) {
      return res.status(400).json({ message: 'instructor_type, instructor_id, and section are required' });
    }
    if (!['doctor', 'ta'].includes(instructor_type)) {
      return res.status(400).json({ message: 'instructor_type must be doctor or ta' });
    }
    const result = await db.query(
      `INSERT INTO course_instructor_sections (course_id, instructor_type, instructor_id, section)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (course_id, section) DO UPDATE SET instructor_type = EXCLUDED.instructor_type, instructor_id = EXCLUDED.instructor_id
       RETURNING *`,
      [courseId, instructor_type, instructor_id, section]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteInstructorSection = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM course_instructor_sections WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCourseInstructors = async (req, res) => {
  try {
    const { courseId } = req.params;
    const doctors = await db.query(`
      SELECT d.id, d.name, d.email, 'doctor' as instructor_type
      FROM doctors d JOIN doctor_courses dc ON d.id = dc.doctor_id
      WHERE dc.course_id = $1 ORDER BY d.name
    `, [courseId]);
    const tas = await db.query(`
      SELECT ta.id, ta.name, ta.email, 'ta' as instructor_type
      FROM teaching_assistants ta JOIN ta_courses tc ON ta.id = tc.ta_id
      WHERE tc.course_id = $1 ORDER BY ta.name
    `, [courseId]);
    res.json([...doctors.rows, ...tas.rows]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCourseInstructorSections, createInstructorSection, deleteInstructorSection, getCourseInstructors };
