// backend/models/RoadmapStage.js
const db = require('../config/database');

class RoadmapStage {
    // الحصول على جميع مراحل مسار معين
    static async getByRoadmapId(roadmapId) {
        const result = await db.query(
            `SELECT * FROM roadmap_stages WHERE roadmap_id = $1 ORDER BY order_index`,
            [roadmapId]
        );
        return result.rows;
    }

    // الحصول على مرحلة بواسطة ID
    static async findById(id) {
        const result = await db.query(
            `SELECT * FROM roadmap_stages WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    }

    // إنشاء مرحلة جديدة
    static async create(roadmapId, title, description, orderIndex, requiredCoursesIds = []) {
        const result = await db.query(
            `INSERT INTO roadmap_stages (roadmap_id, title, description, order_index, required_courses_ids)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [roadmapId, title, description, orderIndex, requiredCoursesIds]
        );
        return result.rows[0];
    }

    // تحديث مرحلة
    static async update(id, title, description, orderIndex, requiredCoursesIds) {
        const result = await db.query(
            `UPDATE roadmap_stages 
             SET title = $1, description = $2, order_index = $3, required_courses_ids = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING *`,
            [title, description, orderIndex, requiredCoursesIds, id]
        );
        return result.rows[0];
    }

    // حذف مرحلة
    static async delete(id) {
        await db.query(`DELETE FROM roadmap_stages WHERE id = $1`, [id]);
        return true;
    }

    // حذف جميع مراحل مسار معين
    static async deleteByRoadmapId(roadmapId) {
        await db.query(`DELETE FROM roadmap_stages WHERE roadmap_id = $1`, [roadmapId]);
        return true;
    }

    // التحقق مما إذا كان الطالب قد أكمل متطلبات مرحلة معينة
    static async isStageCompleted(studentId, stageId) {
        const stage = await this.findById(stageId);
        if (!stage) return false;
        const requiredCourses = stage.required_courses_ids || [];
        if (requiredCourses.length === 0) return true;
        
        // التحقق من أن الطالب أكمل جميع الكورسات المطلوبة (progress >= 100)
        const result = await db.query(
            `SELECT COUNT(*) as completed
             FROM student_courses
             WHERE student_id = $1 AND course_id = ANY($2::int[]) AND progress_percentage >= 100`,
            [studentId, requiredCourses]
        );
        return parseInt(result.rows[0].completed) === requiredCourses.length;
    }
}

module.exports = RoadmapStage;