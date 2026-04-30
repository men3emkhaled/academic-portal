const db = require('../config/database');
const Doctor = require('../models/Doctor');

const getCourseAnalytics = async (req, res) => {
    try {
        const { courseId } = req.params;
        const doctorId = req.doctor.id;

        // Check Access
        const hasAccess = await Doctor.hasCourseAccess(doctorId, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        // 1. Total Enrolled Students
        const studentsQuery = await db.query(
            `SELECT COUNT(DISTINCT student_id) as total_students 
             FROM student_courses WHERE course_id = $1`,
            [courseId]
        );
        const totalStudents = parseInt(studentsQuery.rows[0].total_students);

        // 2. Average Attendance Percentage
        // Attendance logic: 
        // Sessions count = `SELECT COUNT(*) FROM attendance_sessions WHERE course_id = $1`
        // Each student's attendance records count = `SELECT COUNT(*) FROM attendance_records ar JOIN attendance_sessions s ON ar.session_id = s.id WHERE s.course_id = $1 AND ar.is_present = true AND ar.student_id = ?`
        
        const sessionsQuery = await db.query(
            `SELECT COUNT(*) as total_sessions FROM attendance_sessions WHERE course_id = $1`,
            [courseId]
        );
        const totalSessions = parseInt(sessionsQuery.rows[0].total_sessions);

        let averageAttendance = 0;
        let atRiskStudents = [];

        if (totalSessions > 0) {
            const attendanceStats = await db.query(
                `SELECT 
                    sc.student_id, 
                    s.name as student_name,
                    s.section,
                    COUNT(ar.id) as attended_sessions
                 FROM student_courses sc
                 JOIN students s ON sc.student_id = s.id
                 LEFT JOIN attendance_records ar 
                    ON ar.student_id = sc.student_id 
                    AND ar.status = 'present' 
                    AND ar.session_id IN (SELECT id FROM attendance_sessions WHERE course_id = $1)
                 WHERE sc.course_id = $1
                 GROUP BY sc.student_id, s.name, s.section`,
                [courseId]
            );

            let totalAttended = 0;

            attendanceStats.rows.forEach(stat => {
                const attended = parseInt(stat.attended_sessions);
                totalAttended += attended;

                const attendancePercentage = Math.round((attended / totalSessions) * 100);
                
                // Identify At-Risk: < 75% attendance (i.e. > 25% absence)
                if (attendancePercentage < 75) {
                    atRiskStudents.push({
                        student_id: stat.student_id,
                        student_name: stat.student_name,
                        section: stat.section,
                        attendance_percentage: attendancePercentage,
                        missed_sessions: totalSessions - attended,
                        risk_reason: `Low Attendance (${attendancePercentage}%)`
                    });
                }
            });

            if (totalStudents > 0 && totalSessions > 0) {
                averageAttendance = Math.round((totalAttended / (totalStudents * totalSessions)) * 100);
            }
        }

        // 3. Quiz Performance (Adding students with < 50% avg to At-Risk)
        const quizStats = await db.query(
            `SELECT 
                qa.student_id,
                s.name as student_name,
                s.section,
                ROUND(AVG(CASE WHEN COALESCE(qa.total_points, 0) > 0 THEN (COALESCE(qa.score, 0)::numeric / qa.total_points) * 100 ELSE 0 END)) as avg_score
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN students s ON qa.student_id = s.id
             WHERE q.course_id = $1 AND qa.status = 'completed'
             GROUP BY qa.student_id, s.name, s.section`,
            [courseId]
        );

        quizStats.rows.forEach(stat => {
            const avgScore = parseInt(stat.avg_score) || 0;
            if (avgScore < 50) {
                // Check if already in At-Risk array
                const existingIndex = atRiskStudents.findIndex(s => s.student_id === stat.student_id);
                if (existingIndex > -1) {
                    atRiskStudents[existingIndex].risk_reason += ` & Low Grades (${avgScore}%)`;
                    atRiskStudents[existingIndex].avg_score = avgScore;
                } else {
                    atRiskStudents.push({
                        student_id: stat.student_id,
                        student_name: stat.student_name,
                        section: stat.section,
                        attendance_percentage: null,
                        missed_sessions: null,
                        avg_score: avgScore,
                        risk_reason: `Low Grades (${avgScore}%)`
                    });
                }
            }
        });

        // Ensure all at-risk objects have at least null for missing fields to avoid frontend crashes
        const sanitizedAtRisk = atRiskStudents.map(s => ({
            ...s,
            attendance_percentage: s.attendance_percentage ?? null,
            avg_score: s.avg_score ?? null
        }));

        res.json({
            total_students: totalStudents,
            total_sessions: totalSessions,
            average_attendance_percentage: averageAttendance,
            at_risk_count: sanitizedAtRisk.length,
            at_risk_students: sanitizedAtRisk
        });

    } catch (error) {
        console.error('Error fetching course analytics:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourseAnalytics
};
