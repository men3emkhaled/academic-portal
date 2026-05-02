package com.example.academicportal.domain.model

data class MyGradesResponse(
    val student: StudentBasicInfo,
    val grades: List<CourseGrade>,
    val summary: GradesSummary
)

data class StudentBasicInfo(
    val id: String,
    val name: String,
    val level: Int,
    val section: String?
)

data class StudentProfile(
    val id: String,
    val name: String,
    val email: String?,
    val institutional_email: String?,
    val level: Int,
    val section: String?,
    val avatar_url: String?,
    val department_id: Int?
)

data class CourseGrade(
    val course_id: Int,
    val course_name: String,
    val semester: Int,
    val max_score: Double,
    val midterm_score: Double?,
    val practical_score: Double?,
    val oral_score: Double?,
    val total_score: Double?
)

data class GradesSummary(
    val totalEarned: Double,
    val totalPossible: Double,
    val overallPercentage: Int,
    val coursesPassed: Int,
    val totalCourses: Int
)
