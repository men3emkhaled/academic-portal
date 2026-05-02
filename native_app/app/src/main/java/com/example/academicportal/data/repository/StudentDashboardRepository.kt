package com.example.academicportal.data.repository

import com.example.academicportal.data.remote.StudentDashboardService
import com.example.academicportal.domain.model.MyGradesResponse
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StudentDashboardRepository @Inject constructor(
    private val dashboardService: StudentDashboardService
) {
    suspend fun getMyGrades(): Result<MyGradesResponse> {
        return try {
            val response = dashboardService.getMyGrades()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch dashboard data: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMyTimetable(): Result<List<com.example.academicportal.domain.model.TimetableEntry>> {
        return try {
            val response = dashboardService.getMyTimetable()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch timetable: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
