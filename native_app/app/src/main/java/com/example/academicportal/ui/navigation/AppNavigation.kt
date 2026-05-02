package com.example.academicportal.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.academicportal.ui.auth.RoleSelectionScreen

// Define Routes
object Routes {
    const val ROLE_SELECTION = "role_selection"
    const val STUDENT_LOGIN = "student_login"
    const val DOCTOR_LOGIN = "doctor_login"
    const val ADMIN_LOGIN = "admin_login"
    
    // Dashboards
    const val STUDENT_DASHBOARD = "student_dashboard"
    const val DOCTOR_DASHBOARD = "doctor_dashboard"
    const val ADMIN_DASHBOARD = "admin_dashboard"
}

@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = Routes.ROLE_SELECTION) {
        
        // Dashboards
        composable(Routes.STUDENT_DASHBOARD) {
            com.example.academicportal.ui.student.StudentDashboardScreen(
                onLogoutClick = {
                    // Navigate back to role selection and clear backstack
                    navController.navigate(Routes.ROLE_SELECTION) {
                        popUpTo(0)
                    }
                }
            )
        }
        
        // Role Selection
        composable(Routes.ROLE_SELECTION) {
            RoleSelectionScreen(
                onRoleSelected = { role ->
                    when (role) {
                        "student" -> navController.navigate(Routes.STUDENT_LOGIN)
                        "doctor" -> navController.navigate(Routes.DOCTOR_LOGIN)
                        "admin" -> navController.navigate(Routes.ADMIN_LOGIN)
                    }
                }
            )
        }

        // Student Login
        composable(Routes.STUDENT_LOGIN) {
            com.example.academicportal.ui.auth.StudentLoginScreen(
                onLoginSuccess = { navController.navigate(Routes.STUDENT_DASHBOARD) },
                onBackClick = { navController.popBackStack() }
            )
        }

        // Doctor Login
        composable(Routes.DOCTOR_LOGIN) {
            // Placeholder
            androidx.compose.material3.Text("Doctor Login Screen")
        }

        // Admin Login
        composable(Routes.ADMIN_LOGIN) {
            // Placeholder
            androidx.compose.material3.Text("Admin Login Screen")
        }
    }
}
