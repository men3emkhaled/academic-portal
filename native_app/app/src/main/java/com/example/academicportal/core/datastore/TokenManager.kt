package com.example.academicportal.core.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_prefs")

@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private val STUDENT_TOKEN_KEY = stringPreferencesKey("student_token")
        private val DOCTOR_TOKEN_KEY = stringPreferencesKey("doctor_token")
        private val ADMIN_TOKEN_KEY = stringPreferencesKey("admin_token")
    }

    val studentToken: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[STUDENT_TOKEN_KEY]
    }

    suspend fun saveStudentToken(token: String) {
        context.dataStore.edit { preferences ->
            preferences[STUDENT_TOKEN_KEY] = token
        }
    }

    suspend fun clearStudentToken() {
        context.dataStore.edit { preferences ->
            preferences.remove(STUDENT_TOKEN_KEY)
        }
    }
}
