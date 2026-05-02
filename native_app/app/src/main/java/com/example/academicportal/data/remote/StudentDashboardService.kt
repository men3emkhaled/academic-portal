package com.example.academicportal.data.remote

import com.example.academicportal.domain.model.MyGradesResponse
import com.example.academicportal.domain.model.TimetableEntry
import retrofit2.Response
import retrofit2.http.GET

interface StudentDashboardService {
    @GET("grades/my-grades")
    suspend fun getMyGrades(): Response<MyGradesResponse>

    @GET("student/my-timetable")
    suspend fun getMyTimetable(): Response<List<TimetableEntry>>
}
