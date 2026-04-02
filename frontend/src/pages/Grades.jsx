import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

const Grades = () => {
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState({ studentId: '', studentName: '', grades: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      toast.error('Please enter a student ID');
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/grades/student/${studentId}`);
      setStudentData({
        studentId,
        studentName: response.data.studentName,
        grades: response.data.grades
      });
      setSearched(true);
      if (response.data.grades.length === 0) {
        toast.error('No grades found for this student ID');
      } else {
        toast.success('Grades fetched successfully');
      }
    } catch (error) {
      toast.error('Error fetching grades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-charcoal to-black">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold neon-text mb-4 animate-pulse-slow">
            Grade Inspector
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Enter your student ID to access your midterm grades
          </p>
        </div>

        {/* Search Card */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl mb-12 transition-all duration-300 hover:shadow-neon/20">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Enter your Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-dark/50 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="neon-button px-8 py-3 font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <span>🔍</span> Search
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {searched && (
          <div className="animate-fadeInUp">
            {studentData.grades.length === 0 ? (
              <div className="text-center py-16 backdrop-blur-sm bg-white/5 rounded-2xl border border-dashed border-gray-600">
                <svg className="w-20 h-20 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 text-xl">No grades found for this student ID.</p>
                <p className="text-gray-500 mt-2">Please check the ID and try again.</p>
              </div>
            ) : (
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
                {/* Student Info Header */}
                {studentData.studentName && (
                  <div className="bg-gradient-to-r from-neon/10 to-transparent px-6 py-4 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-lg">Student:</span>
                        <span className="text-2xl font-bold text-neon">{studentData.studentName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>ID: {studentData.studentId}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grades Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="py-4 px-6 text-neon font-semibold text-lg">Course Name</th>
                        <th className="py-4 px-6 text-neon font-semibold text-lg text-center">Midterm Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.grades.map((grade, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-white/5 transition-all duration-200 hover:bg-white/10 ${
                            idx % 2 === 0 ? 'bg-transparent' : 'bg-white/5'
                          }`}
                        >
                          <td className="py-3 px-6 font-medium text-white">{grade.course_name}</td>
                          <td className="py-3 px-6 text-center">
                            {grade.midterm_score !== null && grade.midterm_score !== undefined ? (
                              <div className="inline-flex items-center gap-2">
                                <span className={`text-2xl font-bold ${grade.midterm_score >= grade.max_score / 2 ? 'text-green-400' : 'text-red-400'}`}>
                                  {grade.midterm_score}
                                </span>
                                <span className="text-gray-400 text-sm">/ {grade.max_score}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-lg">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Note */}
                <div className="bg-white/5 px-6 py-3 text-right text-xs text-gray-500 border-t border-white/10">
                  <span>Midterm results - Semester 2</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Grades;