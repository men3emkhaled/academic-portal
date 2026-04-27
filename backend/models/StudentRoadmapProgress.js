// backend/models/StudentRoadmapProgress.js
const db = require('../config/database');
const RoadmapStage = require('./RoadmapStage');

class StudentRoadmapProgress {
    // الحصول على تقدم طالب في جميع المسارات
    static async getAllForStudent(studentId) {
        const result = await db.query(
            `SELECT spr.*, r.title as roadmap_title, r.description
             FROM student_roadmap_progress spr
             JOIN roadmaps r ON spr.roadmap_id = r.id
             WHERE spr.student_id = $1`,
            [studentId]
        );
        return result.rows;
    }

    // الحصول على تقدم طالب في مسار محدد
    static async get(studentId, roadmapId) {
        const result = await db.query(
            `SELECT * FROM student_roadmap_progress
             WHERE student_id = $1 AND roadmap_id = $2`,
            [studentId, roadmapId]
        );
        return result.rows[0];
    }

    // بدء مسار للطالب (أو استئنافه)
    static async startOrResume(studentId, roadmapId, currentStageId, completedStageIds = []) {
        const result = await db.query(
            `INSERT INTO student_roadmap_progress (student_id, roadmap_id, current_stage_id, completed_stage_ids)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (student_id, roadmap_id) DO UPDATE SET
                current_stage_id = EXCLUDED.current_stage_id,
                completed_stage_ids = EXCLUDED.completed_stage_ids,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [studentId, roadmapId, currentStageId, completedStageIds]
        );
        return result.rows[0];
    }

    // تحديث المرحلة الحالية
    static async updateCurrentStage(studentId, roadmapId, stageId) {
        const result = await db.query(
            `UPDATE student_roadmap_progress 
             SET current_stage_id = $1, updated_at = CURRENT_TIMESTAMP
             WHERE student_id = $2 AND roadmap_id = $3
             RETURNING *`,
            [stageId, studentId, roadmapId]
        );
        return result.rows[0];
    }

    // إضافة مرحلة إلى قائمة المكتملة
    static async addCompletedStage(studentId, roadmapId, stageId) {
        const current = await this.get(studentId, roadmapId);
        if (!current) return null;
        let completed = current.completed_stage_ids || [];
        if (!completed.includes(stageId)) {
            completed.push(stageId);
        }
        const result = await db.query(
            `UPDATE student_roadmap_progress 
             SET completed_stage_ids = $1, updated_at = CURRENT_TIMESTAMP
             WHERE student_id = $2 AND roadmap_id = $3
             RETURNING *`,
            [completed, studentId, roadmapId]
        );
        return result.rows[0];
    }

    // الترقية التلقائية إلى المرحلة التالية إذا اكتملت المتطلبات
    static async autoAdvance(studentId, roadmapId) {
        const progress = await this.get(studentId, roadmapId);
        if (!progress) return null;
        const currentStageId = progress.current_stage_id;
        if (!currentStageId) return null;
        
        const isCompleted = await RoadmapStage.isStageCompleted(studentId, currentStageId);
        if (isCompleted) {
            // إضافة المرحلة الحالية إلى المكتملة
            await this.addCompletedStage(studentId, roadmapId, currentStageId);
            // الحصول على المرحلة التالية
            const stages = await RoadmapStage.getByRoadmapId(roadmapId);
            const currentIndex = stages.findIndex(s => s.id === currentStageId);
            const nextStage = stages[currentIndex + 1];
            if (nextStage) {
                await this.updateCurrentStage(studentId, roadmapId, nextStage.id);
                return { advanced: true, newStageId: nextStage.id };
            } else {
                // اكتمل كل المسار
                await this.updateCurrentStage(studentId, roadmapId, null);
                return { advanced: true, completed: true };
            }
        }
        return { advanced: false };
    }
}

module.exports = StudentRoadmapProgress;