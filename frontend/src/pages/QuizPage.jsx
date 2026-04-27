import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import { useStudentAuth } from '../context/StudentAuthContext';
import { Clock, Check, FolderUp, Camera, AlertCircle, ArrowLeft, ArrowRight, Save, Play, Target, RotateCcw, MonitorPlay, Activity, Copy, CheckCircle2, FileQuestion, Image as ImageIcon } from 'lucide-react';

const getDirectImageUrl = (url) => {
  if (!url) return '';
  if (url.includes('ibb.co') && !url.includes('i.ibb.co')) {
    const match = url.match(/ibb\.co\/([a-zA-Z0-9]+)$/);
    if (match) {
      return `https://i.ibb.co/${match[1]}/image.jpg`;
    }
  }
  return url;
};

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useStudentAuth();
  
  const queryParams = new URLSearchParams(location.search);
  const resumeAttemptId = queryParams.get('resume');

  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: file or text }
  const [writtenText, setWrittenText] = useState({}); // { questionId: text }
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  const attemptIdRef = useRef(null);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const payload = resumeAttemptId ? { attempt_id: resumeAttemptId } : {};
        const response = await studentApi.post(`/quizzes/${quizId}/start`, payload);
        const data = response.data;
        setQuizData(data);
        attemptIdRef.current = data.attempt_id;
        setTimeLeft(data.remaining_seconds);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to start quiz');
        navigate('/student/quizzes', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    startQuiz();
  }, [quizId, navigate, resumeAttemptId]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!hasSubmittedRef.current && attemptIdRef.current) {
        e.preventDefault();
        e.returnValue = 'You have an ongoing quiz. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const submitQuiz = useCallback(async (isAutoSubmit = false) => {
    if (submitting || hasSubmittedRef.current) return;
    const attemptId = attemptIdRef.current;
    if (!attemptId) {
      toast.error('Invalid attempt');
      navigate('/student/quizzes', { replace: true });
      return;
    }
    setSubmitting(true);
    hasSubmittedRef.current = true;
    try {
      const response = await studentApi.post(`/quizzes/attempts/${attemptId}/submit`);
      const data = response.data;
      if (data.status === 'pending_review') {
        toast.success('Quiz submitted for review!');
      } else {
        toast.success(`Quiz submitted! Score: ${data.percentage}%`);
      }
      navigate(`/student/quizzes/${quizId}/result/${attemptId}`, { replace: true });
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Submission failed');
      hasSubmittedRef.current = false;
      setSubmitting(false);
    }
  }, [submitting, quizId, navigate]);

  const handleTimeOut = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    toast.error('Time is up! Submitting quiz...');
    await submitQuiz(true);
  }, [submitQuiz]);

  useEffect(() => {
    if (timeLeft <= 0 || !quizData) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft, quizData, handleTimeOut]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveWrittenAnswer = async (questionId, text, file) => {
    const attemptId = attemptIdRef.current;
    const formData = new FormData();
    formData.append('answer', text || '');
    if (file) {
      formData.append('written_answer', file);
    }
    try {
      await studentApi.post(
        `/quizzes/attempts/${attemptId}/questions/${questionId}/answer`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setAnswers(prev => ({ ...prev, [questionId]: file || text }));
      setWrittenText(prev => ({ ...prev, [questionId]: text }));
      toast.success('Answer saved');
    } catch (error) {
      toast.error('Failed to save answer');
    }
  };

  const saveAnswerToServer = async (questionId, answer) => {
    const attemptId = attemptIdRef.current;
    try {
      await studentApi.post(
        `/quizzes/attempts/${attemptId}/questions/${questionId}/answer`,
        { answer }
      );
      return true;
    } catch (error) {
      console.error('Failed to save answer:', error);
      return false;
    }
  };

  const handleAnswerSelect = useCallback((questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    saveAnswerToServer(questionId, answer).catch(() => {
      toast.error('Failed to save answer. Please check your connection.');
    });
  }, []);

  const handleNext = () => {
    if (!quizData?.questions) return;
    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmitClick = () => {
    if (hasSubmittedRef.current) return;
    if (window.confirm('Are you sure you want to submit?')) {
      submitQuiz();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark flex items-center justify-center transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <p className="text-xl mb-4"><AlertCircle className="w-8 h-8 text-primary mx-auto mb-4" /> No questions available</p>
        <button
          onClick={() => navigate('/student/quizzes')}
          className="px-6 py-3 bg-primary text-white dark:text-dark rounded-xl font-bold"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quizData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
      <main className="pt-8 px-6 max-w-2xl mx-auto pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-headline font-extrabold text-2xl text-primary">
            {quizData.quiz_title}
          </h1>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 dark:border-primary/10">
            <span className="text-xl"><Clock className="w-5 h-5 text-primary" /></span>
            <span className="font-mono text-primary font-bold text-lg tracking-widest">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-3xl font-headline font-black text-primary italic">
              {currentIndex + 1}<span className="text-primary/40 dark:text-primary/20 font-normal not-italic mx-1">/</span>{quizData.questions.length}
            </span>
            <span className="text-xs font-label font-medium text-primary/60 dark:text-primary/40 tracking-wider">
              PROGRESS
            </span>
          </div>
          <div className="h-1.5 w-full bg-primary/20 dark:bg-primary/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary shadow-[0_0_15px_rgba(46,204,113,0.6)] dark:shadow-[0_0_15px_rgba(var(--primary),0.6)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="relative mb-10">
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 dark:bg-primary/5 blur-3xl rounded-full"></div>
          <div className="relative p-8 bg-white dark:bg-dark-card rounded-2xl border-l-4 border-primary shadow-sm dark:shadow-none">
            <h2 className="text-2xl md:text-3xl font-headline font-bold leading-tight text-gray-900 dark:text-white">
              {currentQuestion.question_text}
            </h2>
            {currentQuestion.image_url && (
              <div className="mt-4 flex justify-center">
                <img
                  src={getDirectImageUrl(currentQuestion.image_url)}
                  alt="Question illustration"
                  className="max-h-64 rounded-lg border border-gray-200 dark:border-white/10/30"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x200/1a1a1a/8eff71?text=Image+Not+Available';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-12">
          {currentQuestion.question_type === 'true_false' ? (
            ['true', 'false'].map((option) => {
              const isSelected = answers[currentQuestion.id] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary/10 border-2 border-primary shadow-[0_4px_15px_rgba(46,204,113,0.15)] dark:shadow-[0_0_30px_rgba(var(--primary),0.15)]'
                      : 'bg-white dark:bg-dark-glass border-gray-200 dark:border-transparent hover:border-primary/40 dark:hover:border-primary/20 shadow-sm dark:shadow-none'
                  }`}
                >
                  <span className="text-lg font-medium capitalize text-gray-900 dark:text-white">{option}</span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white dark:text-dark text-sm font-bold"><Check className="w-4 h-4 text-white dark:text-dark" /></span>
                    </div>
                  )}
                </button>
              );
            })
          ) : currentQuestion.question_type === 'mcq' ? (
            currentQuestion.options?.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = answers[currentQuestion.id] === letter;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(currentQuestion.id, letter)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary/10 border-2 border-primary shadow-[0_4px_15px_rgba(46,204,113,0.15)] dark:shadow-[0_0_30px_rgba(var(--primary),0.15)]'
                      : 'bg-white dark:bg-dark-glass border-gray-200 dark:border-transparent hover:border-primary/40 dark:hover:border-primary/20 shadow-sm dark:shadow-none'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <span
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-black ${
                        isSelected
                          ? 'bg-primary text-white dark:text-dark'
                          : 'bg-primary/10 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className={`text-lg ${isSelected ? 'font-bold text-primary' : 'font-medium text-gray-900 dark:text-white'}`}>
                      {opt}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white dark:text-dark text-sm font-bold"><Check className="w-4 h-4 text-white dark:text-dark" /></span>
                    </div>
                  )}
                </button>
              );
            })
          ) : (
            <div className="bg-white dark:bg-dark-glass p-6 rounded-2xl border border-primary/20 shadow-sm dark:shadow-none">
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Write your answer or upload/take a photo</p>
              
              <textarea
                placeholder="Type your answer here..."
                value={writtenText[currentQuestion.id] || ''}
                onChange={(e) => setWrittenText(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-dark-card border border-primary/30 rounded-xl p-3 text-gray-900 dark:text-white mb-4 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                rows="4"
              />
              
              <div className="flex gap-3 mb-4">
                <label className="flex-1 cursor-pointer bg-gray-50 dark:bg-dark-card border border-dashed border-primary/40 rounded-xl p-4 text-center hover:border-primary transition">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setAnswers(prev => ({ ...prev, [currentQuestion.id]: file }));
                      }
                    }}
                  />
                  <span className="text-2xl block mb-1"><FolderUp className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" /></span>
                  <span className="text-primary text-sm font-medium">Choose File</span>
                </label>
                
                <label className="flex-1 cursor-pointer bg-gray-50 dark:bg-dark-card border border-dashed border-primary/40 rounded-xl p-4 text-center hover:border-primary transition">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setAnswers(prev => ({ ...prev, [currentQuestion.id]: file }));
                      }
                    }}
                  />
                  <span className="text-2xl block mb-1"><Camera className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" /></span>
                  <span className="text-primary text-sm font-medium">Take Photo</span>
                </label>
              </div>
              
              {answers[currentQuestion.id] instanceof File && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(answers[currentQuestion.id])}
                    alt="Preview"
                    className="max-h-48 rounded-lg mx-auto border border-gray-200 dark:border-white/10/30"
                  />
                </div>
              )}
              
              <button
                onClick={() => {
                  const text = writtenText[currentQuestion.id] || '';
                  const file = answers[currentQuestion.id] instanceof File ? answers[currentQuestion.id] : null;
                  if (!text && !file) {
                    toast.error('Please provide an answer or upload/take a photo');
                    return;
                  }
                  saveWrittenAnswer(currentQuestion.id, text, file);
                }}
                className="mt-4 bg-primary/10 dark:bg-primary/20 text-primary font-bold px-4 py-2 rounded-lg text-sm hover:bg-primary/20 dark:hover:bg-primary/30 transition"
              >
                Save Answer
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3 w-full">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1 py-4 bg-white dark:bg-dark-glass text-gray-600 dark:text-gray-400 font-headline font-bold text-lg rounded-xl border border-gray-200 dark:border-white/10/30 hover:bg-gray-50 dark:hover:bg-primary/10 transition disabled:opacity-50 disabled:bg-gray-100 dark:disabled:opacity-30 disabled:cursor-not-allowed shadow-sm dark:shadow-none"
            >
              ← Previous
            </button>
            {currentIndex === quizData.questions.length - 1 ? (
              <button
                onClick={handleSubmitClick}
                disabled={submitting || hasSubmittedRef.current}
                className="flex-1 py-4 bg-primary text-white dark:text-dark font-headline font-black text-lg rounded-xl shadow-[0_4px_15px_rgba(46,204,113,0.3)] dark:shadow-[0_12px_40px_rgba(var(--primary),0.25)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tight"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 py-4 bg-primary text-white dark:text-dark font-headline font-black text-lg rounded-xl shadow-[0_4px_15px_rgba(46,204,113,0.3)] dark:shadow-[0_12px_40px_rgba(var(--primary),0.25)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tight"
              >
                Next →
              </button>
            )}
          </div>
          {currentIndex < quizData.questions.length - 1 && (
            <button
              onClick={handleNext}
              className="text-primary/80 dark:text-primary/60 font-label font-bold text-xs uppercase tracking-[0.2em] hover:text-primary transition-colors py-2"
            >
              Skip for now
            </button>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {quizData.questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  isCurrent
                    ? 'bg-primary text-white dark:text-dark shadow-sm'
                    : isAnswered
                    ? 'bg-primary/20 dark:bg-primary/30 text-primary border border-primary'
                    : 'bg-white dark:bg-dark-glass text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-primary/10'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </main>

      <style>{`
        .font-headline {
          font-family: 'Manrope', 'Inter', sans-serif;
        }
        .font-body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default QuizPage;