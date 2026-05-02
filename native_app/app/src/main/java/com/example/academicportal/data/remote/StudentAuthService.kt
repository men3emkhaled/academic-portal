package com.example.academicportal.data.remote

import com.example.academicportal.domain.model.LoginRequest
import com.example.academicportal.domain.model.LoginResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface StudentAuthService {
    @POST("student/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
}
