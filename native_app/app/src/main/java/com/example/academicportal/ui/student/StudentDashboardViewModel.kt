package com.example.academicportal.ui.student

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.academicportal.data.repository.StudentDashboardRepository
import com.example.academicportal.domain.model.MyGradesResponse
import com.example.academicportal.domain.model.TimetableEntry
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class DashboardUiState {
    object Loading : DashboardUiState()
    data class Success(val data: MyGradesResponse) : DashboardUiState()
    data class Error(val message: String) : DashboardUiState()
}

sealed class TimetableUiState {
    object Loading : TimetableUiState()
    data class Success(val data: List<TimetableEntry>) : TimetableUiState()
    data class Error(val message: String) : TimetableUiState()
}

@HiltViewModel
class StudentDashboardViewModel @Inject constructor(
    private val repository: StudentDashboardRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private val _timetableState = MutableStateFlow<TimetableUiState>(TimetableUiState.Loading)
    val timetableState: StateFlow<TimetableUiState> = _timetableState.asStateFlow()

    init {
        fetchDashboardData()
        fetchTimetable()
    }

    fun fetchDashboardData() {
        viewModelScope.launch {
            _uiState.value = DashboardUiState.Loading
            val result = repository.getMyGrades()
            result.onSuccess { data ->
                _uiState.value = DashboardUiState.Success(data)
            }.onFailure { error ->
                _uiState.value = DashboardUiState.Error(error.message ?: "Failed to load dashboard")
            }
        }
    }

    fun fetchTimetable() {
        viewModelScope.launch {
            _timetableState.value = TimetableUiState.Loading
            val result = repository.getMyTimetable()
            result.onSuccess { data ->
                _timetableState.value = TimetableUiState.Success(data)
            }.onFailure { error ->
                _timetableState.value = TimetableUiState.Error(error.message ?: "Failed to load timetable")
            }
        }
    }
}
