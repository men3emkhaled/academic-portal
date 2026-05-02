package com.example.academicportal.domain.model

data class TimetableEntry(
    val id: Int,
    val section: String,
    val day_of_week: String,
    val start_time: String,
    val end_time: String,
    val course_name: String,
    val location: String?,
    val instructor: String?,
    val type: String?,
    val is_quiz: Boolean,
    val is_hidden: Boolean,
    val department_id: Int?
)
