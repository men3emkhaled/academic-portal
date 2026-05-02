package com.example.academicportal.domain.model

data class LoginResponse(
    val success: Boolean,
    val token: String?,
    val message: String?,
    val student: StudentData?
)

data class StudentData(
    val academic_id: String,
    val name: String,
    val email: String,
    val level: Int
)
