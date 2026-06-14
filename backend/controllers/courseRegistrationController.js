const db = require('../config/database');

// ── GPA Scale ──
const getGradeInfo = (percentage) => {
  if (percentage >= 90) return { letter: 'A+', points: 4.0 };
  if (percentage >= 85) return { letter: 'A',  points: 3.7 };
  if (percentage >= 80) return { letter: 'B+', points: 3.3 };
  if (percentage >= 75) return { letter: 'B',  points: 3.0 };
  if (percentage >= 70) return { letter: 'C+', points: 2.7 };
  if (percentage >= 65) return { letter: 'C',  points: 2.0 };
  if (percentage >= 60) return { letter: 'D+', points: 1.3 };
  if (percentage >= 50) return { letter: 'D',  points: 1.0 };
  return { letter: 'F', points: 0.0 };
};

// ── GET /student/registration/available-courses ──
const getAvailableCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student info
    const studentResult = await db.query(
      'SELECT department_id FROM students WHERE id = $1',
      [studentId]
    );
    if (!studentResult.rows[0]) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const { department_id } = studentResult.rows[0];

    // Get courses for this department + shared courses (department_id IS NULL)
    // Exclude already registered courses
    const result = await db.query(
      `SELECT c.id, c.name, c.semester, c.description, c.credit_hours,
              c.max_score, c.midterm_max, c.practical_max, c.oral_max,
              c.department_id,
              d.name as department_name, d.code as department_code
       FROM courses c
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.id NOT IN (
         SELECT course_id FROM student_courses WHERE student_id = $1
       )
       AND (c.department_id = $2 OR c.department_id IS NULL)
       ORDER BY c.semester, c.name`,
      [studentId, department_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching available courses:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── GET /student/registration/my-courses ──
const getRegisteredCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await db.query(
      `SELECT sc.id as enrollment_id, sc.course_id, sc.status, sc.enrolled_at,
              c.name as course_name, c.semester, c.credit_hours,
              c.max_score, c.midterm_max, c.practical_max, c.oral_max,
              c.department_id,
              d.name as department_name,
              g.midterm_score, g.midterm_status,
              g.practical_score, g.practical_status,
              g.oral_score, g.oral_status
       FROM student_courses sc
       JOIN courses c ON sc.course_id = c.id
       LEFT JOIN departments d ON c.department_id = d.id
       LEFT JOIN grades g ON g.enrollment_id = sc.id
       WHERE sc.student_id = $1
       ORDER BY c.semester, c.name`,
      [studentId]
    );

    // Calculate GPA
    let totalPoints = 0;
    let totalCreditHours = 0;

    const courses = result.rows.map(row => {
      const midterm = row.midterm_score != null ? parseFloat(row.midterm_score) : null;
      const practical = row.practical_score != null ? parseFloat(row.practical_score) : null;
      const oral = row.oral_score != null ? parseFloat(row.oral_score) : null;
      const maxScore = parseFloat(row.max_score) || 40;
      const creditHours = parseInt(row.credit_hours) || 3;

      let gradeInfo = null;
      let totalScore = null;
      let percentage = null;
      const hasAnyGrade = midterm !== null || practical !== null || oral !== null;

      if (hasAnyGrade) {
        totalScore = (midterm || 0) + (practical || 0) + (oral || 0);
        percentage = (totalScore / maxScore) * 100;
        gradeInfo = getGradeInfo(percentage);

        totalPoints += gradeInfo.points * creditHours;
        totalCreditHours += creditHours;
      }

      return {
        ...row,
        total_score: totalScore,
        percentage: percentage != null ? Math.round(percentage * 10) / 10 : null,
        grade_letter: gradeInfo?.letter || null,
        grade_points: gradeInfo?.points || null,
        credit_hours: creditHours,
      };
    });

    const gpa = totalCreditHours > 0
      ? Math.round((totalPoints / totalCreditHours) * 100) / 100
      : null;

    res.json({
      courses,
      summary: {
        total_courses: courses.length,
        total_credit_hours: courses.reduce((sum, c) => sum + (parseInt(c.credit_hours) || 3), 0),
        graded_courses: courses.filter(c => c.grade_letter !== null).length,
        gpa,
      },
    });
  } catch (error) {
    console.error('Error fetching registered courses:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── POST /student/registration/register ──
const registerCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ message: 'course_id is required' });
    }

    // Verify course exists and belongs to student's department (or is shared)
    const studentResult = await db.query(
      'SELECT department_id FROM students WHERE id = $1',
      [studentId]
    );
    if (!studentResult.rows[0]) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const courseResult = await db.query(
      `SELECT id, name, department_id, credit_hours FROM courses WHERE id = $1
       AND (department_id = $2 OR department_id IS NULL)`,
      [course_id, studentResult.rows[0].department_id]
    );
    if (!courseResult.rows[0]) {
      return res.status(404).json({ message: 'Course not found or not available for your department' });
    }

    // Check if already registered
    const existingEnrollment = await db.query(
      'SELECT id FROM student_courses WHERE student_id = $1 AND course_id = $2',
      [studentId, course_id]
    );
    if (existingEnrollment.rows.length > 0) {
      return res.status(409).json({ message: 'Already registered for this course' });
    }

    // Calculate current total credits
    const activeSem = await db.getActiveSemester();
    const currentCreditsResult = await db.query(
      `SELECT COALESCE(SUM(c.credit_hours), 0) as total_credits
       FROM student_courses sc
       JOIN courses c ON sc.course_id = c.id
       WHERE sc.student_id = $1 AND c.semester >= $2`,
      [studentId, activeSem]
    );
    const currentCredits = parseFloat(currentCreditsResult.rows[0].total_credits);
    const newCourseCredits = parseFloat(courseResult.rows[0].credit_hours) || 3;

    if (currentCredits + newCourseCredits > 18) {
      return res.status(400).json({ message: 'Registering this course would exceed the maximum limit of 18 credit hours.' });
    }

    // Enroll
    const enrollment = await db.query(
      `INSERT INTO student_courses (student_id, course_id, progress_percentage, status)
       VALUES ($1, $2, 0, 'active')
       RETURNING *`,
      [studentId, course_id]
    );

    if (enrollment.rows.length === 0) {
      return res.status(409).json({ message: 'Already registered for this course' });
    }

    res.status(201).json({
      message: 'Course registered successfully',
      enrollment: enrollment.rows[0],
    });
  } catch (error) {
    console.error('Error registering course:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /student/registration/drop/:courseId ──
const dropCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;

    // Delete grades first (via enrollment_id)
    await db.query(
      `DELETE FROM grades
       WHERE enrollment_id IN (
         SELECT id FROM student_courses WHERE student_id = $1 AND course_id = $2
       )`,
      [studentId, courseId]
    );

    // Delete enrollment
    const result = await db.query(
      `DELETE FROM student_courses WHERE student_id = $1 AND course_id = $2 RETURNING *`,
      [studentId, courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json({ message: 'Course dropped successfully' });
  } catch (error) {
    console.error('Error dropping course:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── POST /student/registration/register-bulk ──
const registerBulk = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { course_ids } = req.body;

    if (!Array.isArray(course_ids) || course_ids.length === 0) {
      return res.status(400).json({ message: 'course_ids array is required' });
    }

    const studentResult = await db.query(
      'SELECT department_id FROM students WHERE id = $1',
      [studentId]
    );

    if (!studentResult.rows[0]) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Calculate current total credits
    const activeSem = await db.getActiveSemester();
    const currentCreditsResult = await db.query(
      `SELECT COALESCE(SUM(c.credit_hours), 0) as total_credits
       FROM student_courses sc
       JOIN courses c ON sc.course_id = c.id
       WHERE sc.student_id = $1 AND c.semester >= $2`,
      [studentId, activeSem]
    );
    const currentCredits = parseFloat(currentCreditsResult.rows[0].total_credits);

    // Calculate total credits of new courses to register (excluding already registered ones)
    const newCoursesResult = await db.query(
      `SELECT COALESCE(SUM(credit_hours), 0) as new_credits FROM courses 
       WHERE id = ANY($1) 
       AND id NOT IN (SELECT course_id FROM student_courses WHERE student_id = $2)`,
      [course_ids, studentId]
    );
    const newCredits = parseFloat(newCoursesResult.rows[0].new_credits);

    if (currentCredits + newCredits > 18) {
      return res.status(400).json({ message: 'Registering these courses would exceed the maximum limit of 18 credit hours.' });
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      let enrolled = 0;

      for (const courseId of course_ids) {
        // Verify course belongs to department or is shared
        const courseCheck = await client.query(
          `SELECT id FROM courses WHERE id = $1
           AND (department_id = $2 OR department_id IS NULL)`,
          [courseId, studentResult.rows[0].department_id]
        );

        if (courseCheck.rows[0]) {
          const result = await client.query(
            `INSERT INTO student_courses (student_id, course_id, progress_percentage, status)
             VALUES ($1, $2, 0, 'active')
             ON CONFLICT (student_id, course_id) DO NOTHING
             RETURNING *`,
            [studentId, courseId]
          );
          if (result.rows.length > 0) enrolled++;
        }
      }

      await client.query('COMMIT');
      res.status(201).json({
        message: `Successfully registered ${enrolled} courses`,
        enrolled_count: enrolled,
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk registering courses:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAvailableCourses,
  getRegisteredCourses,
  registerCourse,
  dropCourse,
  registerBulk,
};
