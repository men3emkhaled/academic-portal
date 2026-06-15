import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, BookOpen, FileText, Download, ArrowLeft, ArrowRight, Award, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { programsData } from '../utils/programsData';
import { toast } from 'react-hot-toast';

export default function ProgramDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [activeTab, setActiveTab] = useState('description');

  const program = programsData.find(p => p.id === parseInt(id));

  if (!program) {
    return (
      <div className={`min-h-screen text-start font-sans flex flex-col justify-between ${isDarkMode ? 'bg-[#030307] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
        <Header />
        <main className="flex-grow z-10 flex flex-col items-center justify-center p-6 text-center">
          <GraduationCap className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
          <h2 className="text-2xl font-black mb-2">{isAr ? "البرنامج الأكاديمي غير موجود" : "Program Not Found"}</h2>
          <p className="text-xs text-slate-400 mb-6">{isAr ? "عذراً، لم نتمكن من العثور على تفاصيل هذا البرنامج الأكاديمي." : "Sorry, we couldn't find the details for this academic program."}</p>
          <button
            onClick={() => navigate('/programs')}
            className="bg-[#2cfc7d] hover:bg-[#25d366] text-black font-black text-xs px-6 py-3 rounded-xl transition-all flex items-center gap-2"
          >
            {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {isAr ? "العودة لجميع البرامج" : "Back to Programs"}
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // Generate fallback details if they don't exist in the static data file
  const getProgramDetails = () => {
    if (program.details) return program.details;

    // Fallback details generated dynamically for all other programs
    return {
      descTabAr: {
        title: "وصف البرنامج الأكاديمي",
        content: `يهدف ${program.titleAr} بـ ${program.facultyAr} بجامعة الزقازيق الأهلية إلى تقديم تجربة تعليمية حديثة ومبتكرة تواكب الثورة الصناعية والتحول الرقمي لتأهيل الطلاب بالمهارات التطبيقية المطلوبة في أسواق العمل المعاصرة.`,
        points: [
          "تقديم محتوى أكاديمي وتدريبي متميز يدمج المناهج العالمية بالتدريب العملي.",
          "توفير بيئة تعليمية ذكية تحفز على الابتكار والتعلم المستمر.",
          "إكساب الطلاب مهارات حل المشكلات والتفكير النقدي.",
          "المساهمة في تحقيق التنمية المستدامة وسد فجوة المهارات المهنية والتقنية."
        ]
      },
      descTabEn: {
        title: "Academic Program Description",
        content: `The ${program.titleEn} at ${program.facultyEn} is tailored to offer cutting-edge knowledge and practical competencies, aligning students with local and international trends.`,
        points: [
          "Delivering advanced curricula integrating standard theories and practical fieldworks.",
          "Providing a smart, inclusive, and collaborative environment supporting innovation.",
          "Fostering design thinking, problem solving, and analytical capacities.",
          "Meeting the expanding demands for qualified specialists in global markets."
        ]
      },
      bylawTabAr: {
        title: "اللائحة الدراسية",
        content: `تشمل اللائحة الدراسية لـ ${program.titleAr} مجموعة من القواعد والأنظمة المنظمة للدراسة ونظام الساعات المعتمدة في الكلية. يمكنك تحميل الدليل الدراسي للحصول على كافة التفاصيل.`,
        points: [
          "نظام الدراسة والساعات المعتمدة للفصول الدراسية",
          "نظام الامتحانات وطرق التقييم والدرجات",
          "شروط النجاح والانتقال بين المستويات الأكاديمية",
          "شروط الحصول على درجة البكالوريوس ومتطلبات التخرج",
          "قواعد الحضور والغياب المعتمدة بقرار مجلس الكلية"
        ]
      },
      bylawTabEn: {
        title: "Academic Regulation (Bylaw)",
        content: `The academic regulation for ${program.titleEn} defines the standard credit units, courses requirements, and assessment criteria to achieve the graduation degree.`,
        points: [
          "Credit Hours framework and semesters distributions",
          "Course assessments, examinations, and GPA calculation rules",
          "Academic progression requirements and prerequisites",
          "Graduation requirements and credit completion target",
          "Attendance rules and mandatory presence guidelines"
        ]
      },
      filesTabAr: {
        title: "الملفات والوثائق المرفقة",
        files: [
          { name: `اللائحة الدراسية لـ ${program.titleAr}.pdf`, size: "2.1 MB" },
          { name: `دليل الطالب التعريفي - ${program.facultyAr}.pdf`, size: "1.5 MB" }
        ]
      },
      filesTabEn: {
        title: "Attached Documents & Files",
        files: [
          { name: `${program.titleEn} Bylaw Document.pdf`, size: "2.1 MB" },
          { name: `${program.facultyEn} Student Handbook.pdf`, size: "1.5 MB" }
        ]
      }
    };
  };

  const details = getProgramDetails();
  const currentDesc = isAr ? details.descTabAr : details.descTabEn;
  const currentBylaw = isAr ? details.bylawTabAr : details.bylawTabEn;
  const currentFiles = isAr ? details.filesTabAr : details.filesTabEn;

  const handleDownload = (filename) => {
    toast.success(isAr ? `بدأ تحميل الملف: ${filename}` : `Downloading file: ${filename}`);
  };

  return (
    <div className={`min-h-screen text-start font-sans transition-colors duration-500 overflow-x-hidden relative flex flex-col justify-between ${isDarkMode ? 'bg-[#030307] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>

      {/* Dynamic Animated Ambient Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 45, -25, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-[450px] h-[450px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -35, 45, 0],
            y: [0, 60, -35, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px] bg-[#2cfc7d]/5 rounded-full blur-[130px]"
        />
      </div>

      {/* Shared Header Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow z-10 max-w-[1400px] mx-auto px-6 lg:px-8 py-12 md:py-16 w-full">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/programs')}
          className="mb-8 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#2cfc7d] transition-colors flex items-center gap-2 group"
        >
          {isAr ? <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />}
          {isAr ? "العودة إلى البرامج الأكاديمية" : "Back to Academic Programs"}
        </button>

        {/* Grand Banner Header */}
        <div className="bg-white dark:bg-[#0d0d14] border-b-4 border-slate-900 dark:border-white/10 rounded-[2rem] p-8 md:p-12 mb-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2cfc7d]/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <span className="px-3.5 py-1.5 rounded-lg bg-[#2cfc7d]/10 text-[#2cfc7d] text-[10px] font-black uppercase tracking-wider">
              {isAr ? program.facultyAr : program.facultyEn}
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight uppercase">
              {isAr ? program.titleAr : program.titleEn}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-bold pt-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span>{isAr ? "مدة الدراسة:" : "Duration:"} {isAr ? program.durationAr : program.durationEn}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#2cfc7d]" />
                <span>{isAr ? "المصروفات السنوية:" : "Tuition:"} {program.fees} {isAr ? "جنيه مصري" : "EGP"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Display Box (Col 8) */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-[#0d0d14] border border-gray-200/50 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative min-h-[400px]">
              
              <AnimatePresence mode="wait">
                {activeTab === 'description' && (
                  <motion.div
                    key="description"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 text-start"
                  >
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                      <Info className="w-6 h-6 text-[#2cfc7d]" />
                      {currentDesc.title}
                    </h2>
                    
                    <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                      {currentDesc.content}
                    </p>

                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#2cfc7d]">{isAr ? "أهداف البرنامج الأساسية:" : "Program Core Goals:"}</h3>
                      <ul className="space-y-3.5">
                        {currentDesc.points.map((pt, index) => (
                          <li key={pt?.id || index} className="text-xs font-medium text-slate-500 dark:text-slate-300 flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d] mt-1.5 flex-shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'bylaw' && (
                  <motion.div
                    key="bylaw"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 text-start"
                  >
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                      <BookOpen className="w-6 h-6 text-purple-500" />
                      {currentBylaw.title}
                    </h2>
                    
                    <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                      {currentBylaw.content}
                    </p>

                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-purple-500">{isAr ? "أهم بنود اللائحة:" : "Key Regulations:"}</h3>
                      <ul className="space-y-3.5">
                        {currentBylaw.points.map((pt, index) => (
                          <li key={pt?.id || index} className="text-xs font-medium text-slate-500 dark:text-slate-300 flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'files' && (
                  <motion.div
                    key="files"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 text-start"
                  >
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                      <FileText className="w-6 h-6 text-blue-500" />
                      {currentFiles.title}
                    </h2>
                    
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] p-12 text-center space-y-4 mt-6">
                      <div className="p-4 bg-blue-500/10 rounded-full text-blue-500">
                        <FileText className="w-8 h-8 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {isAr ? "لا توجد ملفات مرفقة حالياً" : "No Attached Files Currently"}
                        </h4>
                        <p className="text-xs text-slate-400 dark:text-gray-500 max-w-md mx-auto leading-relaxed">
                          {isAr ? "لم يتم إرفاق أي لوائح أو ملفات تعريفية خاصة بهذا البرنامج الأكاديمي في الوقت الحالي." : "No bylaws, booklets, or regulatory documents are currently available for this academic program."}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

          {/* Sidebar Tab Menu (Col 4) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-[#0d0d14] border border-gray-200/50 dark:border-white/5 p-4 rounded-[2rem] shadow-sm flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
              
              <button
                onClick={() => setActiveTab('description')}
                className={`w-full text-xs font-black uppercase tracking-wider px-5 py-4 rounded-2xl flex items-center justify-between gap-3 transition-all flex-shrink-0 lg:flex-shrink ${
                  activeTab === 'description'
                    ? 'bg-[#2cfc7d]/10 text-[#2cfc7d] border-l-4 border-[#2cfc7d]'
                    : 'text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Info className="w-4.5 h-4.5" />
                  <span>{isAr ? "وصف البرنامج" : "Program Description"}</span>
                </div>
                <ChevronRight className={`w-4 h-4 hidden lg:block ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => setActiveTab('bylaw')}
                className={`w-full text-xs font-black uppercase tracking-wider px-5 py-4 rounded-2xl flex items-center justify-between gap-3 transition-all flex-shrink-0 lg:flex-shrink ${
                  activeTab === 'bylaw'
                    ? 'bg-purple-500/10 text-purple-500 border-l-4 border-purple-500'
                    : 'text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4.5 h-4.5" />
                  <span>{isAr ? "اللائحة الدراسية" : "Regulations (Bylaw)"}</span>
                </div>
                <ChevronRight className={`w-4 h-4 hidden lg:block ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`w-full text-xs font-black uppercase tracking-wider px-5 py-4 rounded-2xl flex items-center justify-between gap-3 transition-all flex-shrink-0 lg:flex-shrink ${
                  activeTab === 'files'
                    ? 'bg-blue-500/10 text-blue-500 border-l-4 border-blue-500'
                    : 'text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4.5 h-4.5" />
                  <span>{isAr ? "الملفات والوثائق" : "Files & Documents"}</span>
                </div>
                <ChevronRight className={`w-4 h-4 hidden lg:block ${isAr ? 'rotate-180' : ''}`} />
              </button>

            </div>
          </div>

        </div>

      </main>

      {/* Shared Footer */}
      <Footer />

    </div>
  );
}
