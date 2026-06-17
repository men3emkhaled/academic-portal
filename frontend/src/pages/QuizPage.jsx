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
  AlertTriangle,
  FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal, LoadingState, EmptyState } from "@/components/common";
import { cn } from "@/lib/utils";

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
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
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
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="flex min-h-screen items-center justify-center bg-background"
      >
        <LoadingState label={t("quizzes.loading")} />
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="flex min-h-screen items-center justify-center bg-background p-6"
      >
        <EmptyState
          icon={FileQuestion}
          title={t("quizzes.no_questions")}
          action={
            <Button variant="outline" onClick={() => navigate("/student/quizzes")}>
              {t("quizzes.back_to_list")}
            </Button>
          }
        />
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / quizData.questions.length) * 100;
  const isLastQuestion = currentIndex === quizData.questions.length - 1;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen bg-background text-foreground"
    >
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        {/* Title + Timer */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
            {quizData.quiz_title}
          </h1>
          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5">
            <Clock className="size-4 text-muted-foreground" />
            <span className="font-mono text-sm font-medium tabular-nums text-foreground">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-end justify-between">
            <span className="text-sm font-medium text-foreground">
              {currentIndex + 1}
              <span className="mx-1 text-muted-foreground">/</span>
              {quizData.questions.length}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("quizzes.progress_label")}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold leading-snug text-foreground">
            {currentQuestion.question_text}
          </h2>
          {currentQuestion.image_url && (
            <div className="mt-4 flex justify-center">
              <img
                src={getDirectImageUrl(currentQuestion.image_url)}
                alt="Question illustration"
                className="max-h-64 rounded-lg border border-border"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/400x200/1a1a1a/8eff71?text=Image+Not+Available";
                }}
              />
            </div>
          )}
        </div>

        {/* Answers */}
        <div className="mb-8 space-y-3">
          {currentQuestion.question_type === "true_false" ? (
            ["true", "false"].map((option) => {
              const isSelected = answers[currentQuestion.id] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-4 text-start transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium capitalize",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {option}
                  </span>
                  {isSelected && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" />
                    </span>
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
                  key={opt || idx}
                  onClick={() => handleAnswerSelect(currentQuestion.id, letter)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-4 text-start transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-semibold",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {letter}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        isSelected ? "font-medium text-primary" : "text-foreground",
                      )}
                    >
                      {opt}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="mb-4 text-sm text-muted-foreground">
                {t("quizzes.written_instruction")}
              </p>

              <Textarea
                placeholder={t("quizzes.type_here")}
                value={writtenText[currentQuestion.id] || ""}
                onChange={(e) =>
                  setWrittenText((prev) => ({
                    ...prev,
                    [currentQuestion.id]: e.target.value,
                  }))
                }
                className="mb-4"
                rows="4"
              />

              <div className="mb-4 flex gap-3">
                <label className="flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/50">
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
                  <FolderUp className="size-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {t("quizzes.choose_file")}
                  </span>
                </label>

                <label className="flex flex-1 cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/50">
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
                  <Camera className="size-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {t("quizzes.take_photo")}
                  </span>
                </label>
              </div>

              {answers[currentQuestion.id] instanceof File && (
                <div className="mt-4">
                  <img
                    src={URL.createObjectURL(answers[currentQuestion.id])}
                    alt="Preview"
                    className="mx-auto max-h-48 rounded-lg border border-border"
                  />
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="mt-4"
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
              >
                {t("quizzes.save_answer")}
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex-1"
            >
              {t("quizzes.prev")}
            </Button>
            {isLastQuestion ? (
              <Button
                size="lg"
                onClick={handleSubmitClick}
                disabled={submitting || hasSubmittedRef.current}
                className="flex-1"
              >
                {submitting ? t("quizzes.submitting") : t("quizzes.submit")}
              </Button>
            ) : (
              <Button size="lg" onClick={handleNext} className="flex-1">
                {t("quizzes.next")}
              </Button>
            )}
          </div>
          {!isLastQuestion && (
            <Button variant="ghost" size="sm" onClick={handleNext}>
              {t("quizzes.skip")}
            </Button>
          )}
        </div>

        {/* Question navigator */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {quizData.questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isAnswered
                      ? "border border-primary bg-primary/10 text-primary"
                      : "border border-border bg-card text-muted-foreground hover:bg-muted/50",
                )}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Strict mode anti-cheat warning */}
        <Modal
          open={showWarningModal}
          onOpenChange={setShowWarningModal}
          size="sm"
          footer={
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowWarningModal(false)}
            >
              {t("quizzes.understand")}
            </Button>
          }
        >
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <span className="flex size-12 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
              <AlertTriangle className="size-6" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {t("quizzes.strict_warning_title")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("quizzes.strict_warning_msg")}
              </p>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default QuizPage;
