import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import studentApi from "../services/studentApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useStudentAuth } from "../context/StudentAuthContext";
import {
  Clock,
  Check,
  FolderUp,
  Camera,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Play,
  Target,
  RotateCcw,
  MonitorPlay,
  Activity,
  Copy,
  CheckCircle2,
  FileQuestion,
  Image as ImageIcon,
} from "lucide-react";

const getDirectImageUrl = (url) => {
  if (!url) return "";
  if (url.includes("ibb.co") && !url.includes("i.ibb.co")) {
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
  const { t } = useTranslation();
  const { logout } = useStudentAuth();

  const queryParams = new URLSearchParams(location.search);
  const resumeAttemptId = queryParams.get("resume");

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
  const warningsCountRef = useRef(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const payload = resumeAttemptId ? { attempt_id: resumeAttemptId } : {};
        const response = await studentApi.post(
          `/quizzes/${quizId}/start`,
          payload,
        );
        const data = response.data;
        setQuizData(data);
        attemptIdRef.current = data.attempt_id;
        setTimeLeft(data.remaining_seconds);

        if (data.is_official) {
          const el = document.documentElement;
          if (el.requestFullscreen) {
            el.requestFullscreen().catch((err) =>
              console.log("Fullscreen error:", err),
            );
          }
        }
      } catch (error) {
        toast.error(error.response?.data?.message || t("quizzes.no_available"));
        navigate("/student/quizzes", { replace: true });
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
        e.returnValue = t("quizzes.leave_confirm");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!quizData?.is_official) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !hasSubmittedRef.current && !submitting) {
        warningsCountRef.current += 1;
        if (warningsCountRef.current === 1) {
          setShowWarningModal(true);
        } else if (warningsCountRef.current >= 2) {
          setShowWarningModal(false);
          toast.error(
            t("quizzes.strict_mode_leave"),
          );
          submitQuiz(true);
        }
      }
    };

    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => {
      e.preventDefault();
      toast.error(t("quizzes.strict_mode_copy"));
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
    };
  }, [quizData, submitQuiz, submitting]);

  const submitQuiz = useCallback(
    async (isAutoSubmit = false) => {
      if (submitting || hasSubmittedRef.current) return;
      const attemptId = attemptIdRef.current;
      if (!attemptId) {
        toast.error(t("common.error"));
        navigate("/student/quizzes", { replace: true });
        return;
      }
      setSubmitting(true);
      hasSubmittedRef.current = true;
      try {
        const response = await studentApi.post(
          `/quizzes/attempts/${attemptId}/submit`,
        );
        const data = response.data;
        if (data.status === "pending_review") {
          toast.success(t("quizzes.submitted_review"));
        } else {
          toast.success(t("quizzes.submitted_score", { percentage: data.percentage }));
        }
        navigate(`/student/quizzes/${quizId}/result/${attemptId}`, {
          replace: true,
        });
      } catch (error) {
        console.error("Submit error:", error);
        toast.error(error.response?.data?.message || "Submission failed");
        hasSubmittedRef.current = false;
        setSubmitting(false);
      }
    },
    [submitting, quizId, navigate],
  );

  const handleTimeOut = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    toast.error(t("quizzes.time_up"));
    await submitQuiz(true);
  }, [submitQuiz, t]);

  useEffect(() => {
    if (timeLeft <= 0 || !quizData) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
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
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const saveWrittenAnswer = async (questionId, text, file) => {
    const attemptId = attemptIdRef.current;
    const formData = new FormData();
    formData.append("answer", text || "");
    if (file) {
      formData.append("written_answer", file);
    }
    try {
      await studentApi.post(
        `/quizzes/attempts/${attemptId}/questions/${questionId}/answer`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setAnswers((prev) => ({ ...prev, [questionId]: file || text }));
      setWrittenText((prev) => ({ ...prev, [questionId]: text }));
      toast.success(t("quizzes.answer_saved"));
    } catch (error) {
      toast.error(t("quizzes.save_failed"));
    }
  };

  const saveAnswerToServer = async (questionId, answer) => {
    const attemptId = attemptIdRef.current;
    try {
      await studentApi.post(
        `/quizzes/attempts/${attemptId}/questions/${questionId}/answer`,
        { answer },
      );
      return true;
    } catch (error) {
      console.error("Failed to save answer:", error);
      return false;
    }
  };

  const handleAnswerSelect = useCallback((questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    saveAnswerToServer(questionId, answer).catch(() => {
      toast.error(t("quizzes.connection_error"));
    });
  }, [t]);

  const handleNext = () => {
    if (!quizData?.questions) return;
    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitClick = () => {
    if (hasSubmittedRef.current) return;
    if (window.confirm(t("quizzes.submit_confirm"))) {
      submitQuiz();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#050505] transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-emerald-500/20 dark:border-emerald-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center animate-pulse">
              <span className="text-xl font-black text-emerald-500">Z</span>
            </div>
          </div>
          <p className="text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-[0.4em] mb-1 animate-pulse">
            ZNU PORTAL
          </p>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-xs tracking-wide">
            {t("quizzes.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <div className="text-xl mb-4 text-center">
          <AlertCircle className="w-8 h-8 text-primary mx-auto mb-4" /> 
          <p>{t("quizzes.no_questions")}</p>
        </div>
        <button
          onClick={() => navigate("/student/quizzes")}
          className="px-6 py-3 bg-primary text-white dark:text-dark rounded-xl font-bold"
        >
          {t("quizzes.back_to_list")}
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
            <span className="text-xl">
              <Clock className="w-5 h-5 text-primary" />
            </span>
            <span className="font-mono text-primary font-bold text-lg tracking-widest">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-3xl font-headline font-black text-primary italic">
              {currentIndex + 1}
              <span className="text-primary/40 dark:text-primary/20 font-normal not-italic mx-1">
                /
              </span>
              {quizData.questions.length}
            </span>
            <span className="text-xs font-label font-medium text-primary/60 dark:text-primary/40 tracking-wider">
              {t("quizzes.progress_label")}
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
                    e.target.src =
                      "https://via.placeholder.com/400x200/1a1a1a/8eff71?text=Image+Not+Available";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-12">
          {currentQuestion.question_type === "true_false" ? (
            ["true", "false"].map((option) => {
              const isSelected = answers[currentQuestion.id] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-primary/10 border-2 border-primary shadow-[0_4px_15px_rgba(46,204,113,0.15)] dark:shadow-[0_0_30px_rgba(var(--primary),0.15)]"
                      : "bg-white dark:bg-dark-glass border-gray-200 dark:border-transparent hover:border-primary/40 dark:hover:border-primary/20 shadow-sm dark:shadow-none"
                  }`}
                >
                  <span className="text-lg font-medium capitalize text-gray-900 dark:text-white">
                    {option}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white dark:text-dark text-sm font-bold">
                        <Check className="w-4 h-4 text-white dark:text-dark" />
                      </span>
                    </div>
                  )}
                </button>
              );
            })
          ) : currentQuestion.question_type === "mcq" ? (
            currentQuestion.options?.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = answers[currentQuestion.id] === letter;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(currentQuestion.id, letter)}
                  className={`w-full text-left p-6 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? "bg-primary/10 border-2 border-primary shadow-[0_4px_15px_rgba(46,204,113,0.15)] dark:shadow-[0_0_30px_rgba(var(--primary),0.15)]"
                      : "bg-white dark:bg-dark-glass border-gray-200 dark:border-transparent hover:border-primary/40 dark:hover:border-primary/20 shadow-sm dark:shadow-none"
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <span
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-black ${
                        isSelected
                          ? "bg-primary text-white dark:text-dark"
                          : "bg-primary/10 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {letter}
                    </span>
                    <span
                      className={`text-lg ${isSelected ? "font-bold text-primary" : "font-medium text-gray-900 dark:text-white"}`}
                    >
                      {opt}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white dark:text-dark text-sm font-bold">
                        <Check className="w-4 h-4 text-white dark:text-dark" />
                      </span>
                    </div>
                  )}
                </button>
              );
            })
          ) : (
            <div className="bg-white dark:bg-dark-glass p-6 rounded-2xl border border-primary/20 shadow-sm dark:shadow-none">
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                {t("quizzes.written_instruction")}
              </p>

              <textarea
                placeholder={t("quizzes.type_here")}
                value={writtenText[currentQuestion.id] || ""}
                onChange={(e) =>
                  setWrittenText((prev) => ({
                    ...prev,
                    [currentQuestion.id]: e.target.value,
                  }))
                }
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
                        setAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: file,
                        }));
                      }
                    }}
                  />
                  <span className="text-2xl block mb-1">
                    <FolderUp className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  </span>
                  <span className="text-primary text-sm font-medium">
                    {t("quizzes.choose_file")}
                  </span>
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
                        setAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: file,
                        }));
                      }
                    }}
                  />
                  <span className="text-2xl block mb-1">
                    <Camera className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  </span>
                  <span className="text-primary text-sm font-medium">
                    {t("quizzes.take_photo")}
                  </span>
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
                  const text = writtenText[currentQuestion.id] || "";
                  const file =
                    answers[currentQuestion.id] instanceof File
                      ? answers[currentQuestion.id]
                      : null;
                  if (!text && !file) {
                    toast.error(
                      t("quizzes.written_instruction"),
                    );
                    return;
                  }
                  saveWrittenAnswer(currentQuestion.id, text, file);
                }}
                className="mt-4 bg-primary/10 dark:bg-primary/20 text-primary font-bold px-4 py-2 rounded-lg text-sm hover:bg-primary/20 dark:hover:bg-primary/30 transition"
              >
                {t("quizzes.save_answer")}
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
              ← {t("quizzes.prev")}
            </button>
            {currentIndex === quizData.questions.length - 1 ? (
              <button
                onClick={handleSubmitClick}
                disabled={submitting || hasSubmittedRef.current}
                className="flex-1 py-4 bg-primary text-white dark:text-dark font-headline font-black text-lg rounded-xl shadow-[0_4px_15px_rgba(46,204,113,0.3)] dark:shadow-[0_12px_40px_rgba(var(--primary),0.25)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tight"
              >
                {submitting ? t("quizzes.submitting") : t("quizzes.submit")}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 py-4 bg-primary text-white dark:text-dark font-headline font-black text-lg rounded-xl shadow-[0_4px_15px_rgba(46,204,113,0.3)] dark:shadow-[0_12px_40px_rgba(var(--primary),0.25)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tight"
              >
                {t("quizzes.next")} →
              </button>
            )}
          </div>
          {currentIndex < quizData.questions.length - 1 && (
            <button
              onClick={handleNext}
              className="text-primary/80 dark:text-primary/60 font-label font-bold text-xs uppercase tracking-[0.2em] hover:text-primary transition-colors py-2"
            >
              {t("quizzes.skip")}
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
                    ? "bg-primary text-white dark:text-dark shadow-sm"
                    : isAnswered
                      ? "bg-primary/20 dark:bg-primary/30 text-primary border border-primary"
                      : "bg-white dark:bg-dark-glass text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-primary/10"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {showWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-[#111] border-2 border-red-500 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-scaleIn">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-2">
                {t("quizzes.strict_warning_title")}
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-8 font-bold">
                {t("quizzes.strict_warning_msg")}
              </p>
              <button
                onClick={() => setShowWarningModal(false)}
                className="w-full py-4 bg-red-500 text-white font-black text-lg rounded-xl hover:bg-red-600 transition-colors uppercase tracking-widest"
              >
                {t("quizzes.understand")}
              </button>
            </div>
          </div>
        )}
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
