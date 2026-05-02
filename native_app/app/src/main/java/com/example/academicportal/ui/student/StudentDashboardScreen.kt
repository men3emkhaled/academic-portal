package com.example.academicportal.ui.student

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StudentDashboardScreen(
    viewModel: StudentDashboardViewModel = hiltViewModel(),
    onLogoutClick: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    val uiState by viewModel.uiState.collectAsState()
    val timetableState by viewModel.timetableState.collectAsState()

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Home") },
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF3B82F6),
                        unselectedIconColor = Color.Gray,
                        selectedTextColor = Color(0xFF3B82F6)
                    )
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.List, contentDescription = "Courses") },
                    label = { Text("Courses") },
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF3B82F6),
                        unselectedIconColor = Color.Gray,
                        selectedTextColor = Color(0xFF3B82F6)
                    )
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.DateRange, contentDescription = "Timetable") },
                    label = { Text("Timetable") },
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF3B82F6),
                        unselectedIconColor = Color.Gray,
                        selectedTextColor = Color(0xFF3B82F6)
                    )
                )
                NavigationBarItem(
                    icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                    label = { Text("Profile") },
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = Color(0xFF3B82F6),
                        unselectedIconColor = Color.Gray,
                        selectedTextColor = Color(0xFF3B82F6)
                    )
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF9FAFB))
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                0 -> HomeTab(uiState = uiState)
                1 -> CoursesTab(uiState = uiState)
                2 -> TimetableTab(timetableState = timetableState)
                3 -> ProfileTab(uiState = uiState, onLogoutClick = onLogoutClick)
            }
        }
    }
}

@Composable
fun CoursesTab(uiState: DashboardUiState) {
    when (uiState) {
        is DashboardUiState.Loading -> Box(Modifier.fillMaxSize(), Alignment.Center) { CircularProgressIndicator() }
        is DashboardUiState.Error -> Box(Modifier.fillMaxSize(), Alignment.Center) { Text(uiState.message, color = Color.Red) }
        is DashboardUiState.Success -> {
            val grades = uiState.data.grades
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Text("My Courses", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1F2937))
                    Spacer(modifier = Modifier.height(8.dp))
                }
                
                if (grades.isEmpty()) {
                    item { Text("No courses enrolled.", color = Color.Gray) }
                }
                
                items(grades.size) { index ->
                    val course = grades[index]
                    Card(
                        modifier = Modifier.fillMaxWidth().height(100.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Row(modifier = Modifier.fillMaxSize(), verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier.fillMaxHeight().width(8.dp).background(Color(0xFF3B82F6))
                            )
                            Column(modifier = Modifier.padding(16.dp).weight(1f)) {
                                Text(course.course_name, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF1F2937))
                                Text("Semester ${course.semester}", color = Color.Gray, fontSize = 14.sp)
                            }
                            // Icon indicating clickability to enter course hub
                            Icon(Icons.Default.List, contentDescription = "Enter Hub", tint = Color.Gray, modifier = Modifier.padding(end = 16.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileTab(uiState: DashboardUiState, onLogoutClick: () -> Unit) {
    when (uiState) {
        is DashboardUiState.Loading -> Box(Modifier.fillMaxSize(), Alignment.Center) { CircularProgressIndicator() }
        is DashboardUiState.Error -> Box(Modifier.fillMaxSize(), Alignment.Center) { Text(uiState.message, color = Color.Red) }
        is DashboardUiState.Success -> {
            val student = uiState.data.student
            Column(
                modifier = Modifier.fillMaxSize().padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(32.dp))
                // Avatar Placeholder
                Box(
                    modifier = Modifier.size(100.dp).clip(RoundedCornerShape(50.dp)).background(Color(0xFF3B82F6)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(student.name.take(1), fontSize = 40.sp, color = Color.White, fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(student.name, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1F2937))
                Text("Academic ID: ${student.id}", color = Color.Gray, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Level ${student.level} | Section ${student.section ?: "N/A"}", color = Color(0xFF3B82F6), fontWeight = FontWeight.Medium)
                
                Spacer(modifier = Modifier.height(48.dp))
                
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Settings", fontWeight = FontWeight.Bold, fontSize = 18.sp, modifier = Modifier.padding(bottom = 16.dp))
                        Text("Change Password", modifier = Modifier.padding(vertical = 8.dp), color = Color(0xFF1F2937))
                        Divider()
                        Text("Link Microsoft Account", modifier = Modifier.padding(vertical = 8.dp), color = Color(0xFF1F2937))
                    }
                }
                
                Spacer(modifier = Modifier.height(32.dp))
                Button(
                    onClick = onLogoutClick,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Log Out", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
@Composable
fun TimetableTab(timetableState: TimetableUiState) {
    when (timetableState) {
        is TimetableUiState.Loading -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }
        is TimetableUiState.Error -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(text = timetableState.message, color = Color.Red)
            }
        }
        is TimetableUiState.Success -> {
            val entries = timetableState.data
            
            if (entries.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No timetable found for your section.", color = Color.Gray)
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize().padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    item {
                        Text(
                            text = "My Timetable",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF1F2937)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }
                    
                    // Group by day of week
                    val grouped = entries.groupBy { it.day_of_week }
                    
                    grouped.forEach { (day, classes) ->
                        item {
                            Text(
                                text = day,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF3B82F6),
                                modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                            )
                        }
                        
                        items(classes.size) { index ->
                            val entry = classes[index]
                            Card(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                                colors = CardDefaults.cardColors(containerColor = Color.White),
                                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Text(entry.course_name, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF1F2937))
                                        Text("${entry.type ?: "Lecture"} | ${entry.instructor ?: "TBD"}", color = Color.Gray, fontSize = 14.sp)
                                    }
                                    Column(
                                        horizontalAlignment = Alignment.End
                                    ) {
                                        Text(
                                            text = "${entry.start_time.take(5)} - ${entry.end_time.take(5)}",
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFF3B82F6),
                                            fontSize = 14.sp
                                        )
                                        Text(entry.location ?: "TBA", color = Color.Gray, fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun HomeTab(uiState: DashboardUiState) {
    when (uiState) {
        is DashboardUiState.Loading -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }
        is DashboardUiState.Error -> {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(text = uiState.message, color = Color.Red)
            }
        }
        is DashboardUiState.Success -> {
            val student = uiState.data.student
            val summary = uiState.data.summary
            
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Text(
                        text = "Welcome Back, ${student.name.split(" ").firstOrNull() ?: "Student"}!",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1F2937)
                    )
                    Text(
                        text = "Level ${student.level} | Section ${student.section ?: "N/A"}",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
                
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF3B82F6))
                    ) {
                        Column(modifier = Modifier.padding(24.dp)) {
                            Text("Current Progress", color = Color.White.copy(alpha = 0.8f))
                            Text("${summary.overallPercentage}%", color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Courses Passed: ${summary.coursesPassed} / ${summary.totalCourses}", color = Color.White.copy(alpha = 0.9f))
                        }
                    }
                }
                
                item {
                    Text(
                        text = "Enrolled Courses",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1F2937),
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
                
                items(uiState.data.grades.size) { index ->
                    val course = uiState.data.grades[index]
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp).fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(course.course_name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Text("Semester ${course.semester}", color = Color.Gray, fontSize = 12.sp)
                            }
                            Text(
                                text = if (course.total_score != null) "${course.total_score}/${course.max_score}" else "Pending",
                                color = if (course.total_score != null) Color(0xFF10B981) else Color.Gray,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CenterText(text: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(text, fontSize = 18.sp, color = Color.Gray)
    }
}

// --- Previews ---
@androidx.compose.ui.tooling.preview.Preview(showBackground = true)
@Composable
fun PreviewHomeTab() {
    val sampleStudent = com.example.academicportal.domain.model.StudentBasicInfo(
        id = "20210014", name = "Ahmed Ali", level = 4, section = "A1"
    )
    val sampleSummary = com.example.academicportal.domain.model.GradesSummary(
        totalCourses = 6, coursesPassed = 5, overallPercentage = 85,
        totalEarned = 85.0, totalPossible = 100.0
    )
    val sampleGrades = listOf(
        com.example.academicportal.domain.model.CourseGrade(
            course_id = 1, course_name = "AI and Machine Learning",
            semester = 1, total_score = 90.0, max_score = 100.0,
            midterm_score = 20.0, practical_score = 20.0, oral_score = 10.0
        ),
        com.example.academicportal.domain.model.CourseGrade(
            course_id = 2, course_name = "Cloud Computing",
            semester = 1, total_score = null, max_score = 100.0,
            midterm_score = null, practical_score = null, oral_score = null
        )
    )
    HomeTab(uiState = DashboardUiState.Success(
        com.example.academicportal.domain.model.MyGradesResponse(
            student = sampleStudent, summary = sampleSummary, grades = sampleGrades
        )
    ))
}

@androidx.compose.ui.tooling.preview.Preview(showBackground = true)
@Composable
fun PreviewTimetableTab() {
    val sampleTimetable = listOf(
        com.example.academicportal.domain.model.TimetableEntry(
            id = 1, section = "A1", day_of_week = "Monday",
            start_time = "09:00", end_time = "11:00",
            course_name = "Artificial Intelligence", location = "Hall 1",
            instructor = "Dr. Sameh", type = "Lecture", is_quiz = false,
            is_hidden = false, department_id = 1
        )
    )
    TimetableTab(timetableState = TimetableUiState.Success(sampleTimetable))
}
