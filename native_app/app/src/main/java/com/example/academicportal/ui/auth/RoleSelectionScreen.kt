package com.example.academicportal.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun RoleSelectionScreen(
    onRoleSelected: (String) -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF3F4F6)), // Light gray background like web
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(24.dp)
        ) {
            Text(
                text = "ZNU PORTAL",
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                color = Color(0xFF10B981), // Emerald green
                letterSpacing = 2.sp,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            Text(
                text = "Select your role to continue",
                fontSize = 16.sp,
                color = Color.Gray,
                modifier = Modifier.padding(bottom = 32.dp)
            )

            // Student Card
            RoleCard(
                title = "Student",
                description = "Access dashboard, courses, and timetable",
                color = Color(0xFF3B82F6), // Blue
                onClick = { onRoleSelected("student") }
            )
            
            Spacer(modifier = Modifier.height(16.dp))

            // Doctor Card
            RoleCard(
                title = "Doctor",
                description = "Manage courses, track student progress",
                color = Color(0xFF10B981), // Emerald
                onClick = { onRoleSelected("doctor") }
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Admin Card
            RoleCard(
                title = "Administrator",
                description = "System management and analytics",
                color = Color(0xFF8B5CF6), // Purple
                onClick = { onRoleSelected("admin") }
            )
        }
    }
}

@Composable
fun RoleCard(
    title: String,
    description: String,
    color: Color,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(color.copy(alpha = 0.1f), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                // Placeholder for icon, using text initials for now
                Text(
                    text = title.first().toString(),
                    color = color,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp
                )
            }
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column {
                Text(
                    text = title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = Color(0xFF1F2937)
                )
                Text(
                    text = description,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
        }
    }
}
