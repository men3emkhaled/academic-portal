const db = require('../config/database');

class StudentProgress {
  // جلب تقدم طالب في مسار معين
  static async getStudentTrackProgress(studentId, trackId) {
    const result = await db.query(
      `SELECT 
        t.id as task_id,
        t.title,
        t.description,
        t.order_index,
        COALESCE(sp.is_completed, false) as is_completed,
        sp.completed_at
       FROM roadmap_tasks t
       LEFT JOIN student_task_progress sp 
         ON sp.task_id = t.id AND sp.student_id = $1
       WHERE t.track_id = $2
       ORDER BY t.order_index`,
      [studentId, trackId]
    );
    return result.rows;
  }

  // تحديث حالة مهمة (تم/لم يتم)
  static async toggleTask(studentId, taskId, isCompleted) {
    const result = await db.query(
      `INSERT INTO student_task_progress (student_id, task_id, is_completed, completed_at) 
       VALUES ($1, $2, $3, CASE WHEN $3 = true THEN CURRENT_TIMESTAMP ELSE NULL END)
       ON CONFLICT (student_id, task_id) 
       DO UPDATE SET 
         is_completed = EXCLUDED.is_completed,
         completed_at = CASE WHEN EXCLUDED.is_completed = true THEN CURRENT_TIMESTAMP ELSE NULL END
       RETURNING *`,
      [studentId, taskId, isCompleted]
    );
    return result.rows[0];
  }

  // جلب نسبة إنجاز الطالب في مسار معين
  static async getCompletionPercentage(studentId, trackId) {
    const result = await db.query(
      `SELECT 
        COUNT(t.id) as total_tasks,
        COUNT(sp.id) as completed_tasks
       FROM roadmap_tasks t
       LEFT JOIN student_task_progress sp 
         ON sp.task_id = t.id AND sp.student_id = $1 AND sp.is_completed = true
       WHERE t.track_id = $2`,
      [studentId, trackId]
    );
    
    const { total_tasks, completed_tasks } = result.rows[0];
    const percentage = total_tasks > 0 ? (completed_tasks / total_tasks) * 100 : 0;
    
    return {
      total_tasks: parseInt(total_tasks),
      completed_tasks: parseInt(completed_tasks),
      percentage: Math.round(percentage)
    };
  }

  // جلب كل تقدم الطالب في كل المسارات
  static async getAllStudentProgress(studentId) {
    const result = await db.query(
      `SELECT 
        ct.id as track_id,
        ct.name as track_name,
        COUNT(rt.id) as total_tasks,
        COUNT(sp.id) as completed_tasks
       FROM career_tracks ct
       LEFT JOIN roadmap_tasks rt ON rt.track_id = ct.id
       LEFT JOIN student_task_progress sp 
         ON sp.task_id = rt.id AND sp.student_id = $1 AND sp.is_completed = true
       GROUP BY ct.id, ct.name
       ORDER BY ct.is_primary DESC`,
      [studentId]
    );
    return result.rows;
  }
}

module.exports = StudentProgress;