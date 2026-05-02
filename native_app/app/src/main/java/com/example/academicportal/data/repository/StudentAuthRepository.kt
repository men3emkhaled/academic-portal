package com.example.academicportal.data.repository

import com.example.academicportal.core.datastore.TokenManager
import com.example.academicportal.data.remote.StudentAuthService
import com.example.academicportal.domain.model.LoginRequest
import com.example.academicportal.domain.model.LoginResponse
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StudentAuthRepository @Inject constructor(
    private val authService: StudentAuthService,
    private val tokenManager: TokenManager
) {
    suspend fun login(academicId: String, password: String): Result<LoginResponse> {
        return try {
            val response = authService.login(LoginRequest(academicId, password))
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.success && body.token != null) {
                    tokenManager.saveStudentToken(body.token)
                    Result.success(body)
                } else {
                    Result.failure(Exception(body.message ?: "Login failed"))
                }
            } else {
                Result.failure(Exception("Error: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
