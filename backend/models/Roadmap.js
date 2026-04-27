// backend/models/Roadmap.js
const db = require('../config/database');

class Roadmap {
    // الحصول على جميع المسارات
    static async getAll() {
        const result = await db.query(
            `SELECT * FROM roadmaps ORDER BY id`
        );
        return result.rows;
    }

    // الحصول على المسارات النشطة فقط
    static async getActive() {
        const result = await db.query(
            `SELECT * FROM roadmaps WHERE is_active = true ORDER BY id`
        );
        return result.rows;
    }

    // الحصول على مسار بواسطة ID مع مراحله
    static async findById(id) {
        const result = await db.query(
            `SELECT r.*, 
                    COALESCE(
                        (SELECT json_agg(rs.* ORDER BY rs.order_index)
                         FROM roadmap_stages rs WHERE rs.roadmap_id = r.id), '[]'::json
                    ) as stages
             FROM roadmaps r
             WHERE r.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    // إنشاء مسار جديد
    static async create(title, description, icon = null) {
        const result = await db.query(
            `INSERT INTO roadmaps (title, description, icon, is_active)
             VALUES ($1, $2, $3, true)
             RETURNING *`,
            [title, description, icon]
        );
        return result.rows[0];
    }

    // تحديث مسار
    static async update(id, title, description, icon, isActive) {
        const result = await db.query(
            `UPDATE roadmaps 
             SET title = $1, description = $2, icon = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING *`,
            [title, description, icon, isActive, id]
        );
        return result.rows[0];
    }

    // حذف مسار (سيتم حذف مراحله تلقائياً بسبب CASCADE)
    static async delete(id) {
        await db.query(`DELETE FROM roadmaps WHERE id = $1`, [id]);
        return true;
    }

    // الحصول على تقدم طالب في مسار معين
    static async getStudentProgress(studentId, roadmapId) {
        const result = await db.query(
            `SELECT spr.*, 
                    rs.title as current_stage_title,
                    (SELECT COUNT(*) FROM roadmap_stages WHERE roadmap_id = $2) as total_stages
             FROM student_roadmap_progress spr
             LEFT JOIN roadmap_stages rs ON spr.current_stage_id = rs.id
             WHERE spr.student_id = $1 AND spr.roadmap_id = $2`,
            [studentId, roadmapId]
        );
        return result.rows[0];
    }

    // بدء طالب لمسار جديد
    static async startForStudent(studentId, roadmapId, firstStageId) {
        const result = await db.query(
            `INSERT INTO student_roadmap_progress (student_id, roadmap_id, current_stage_id, completed_stage_ids)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (student_id, roadmap_id) DO UPDATE SET
                current_stage_id = EXCLUDED.current_stage_id,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [studentId, roadmapId, firstStageId, []]
        );
        return result.rows[0];
    }
}

module.exports = Roadmap;