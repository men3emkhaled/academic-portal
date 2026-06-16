import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, BookOpen, FileText, ArrowLeft, ArrowRight, Award, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { programsData } from '../utils/programsData';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { SectionCard, EmptyState, StatusBadge } from '@/components/common';

export default function ProgramDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [activeTab, setActiveTab] = useState('description');

  const program = programsData.find(p => p.id === parseInt(id));

  if (!program) {
    return (
      <div className="min-h-screen text-start font-sans flex flex-col justify-between bg-background text-foreground">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-lg border bg-card text-muted-foreground mb-4">
            <GraduationCap className="size-6" />
          </span>
          <h2 className="text-xl font-semibold mb-2">{isAr ? "البرنامج الأكاديمي غير موجود" : "Program Not Found"}</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">{isAr ? "عذراً، لم نتمكن من العثور على تفاصيل هذا البرنامج الأكاديمي." : "Sorry, we couldn't find the details for this academic program."}</p>
          <Button onClick={() => navigate('/programs')}>
            {isAr ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
            {isAr ? "العودة لجميع البرامج" : "Back to Programs"}
          </Button>
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

  const tabs = [
    { id: 'description', icon: Info, label: isAr ? "وصف البرنامج" : "Program Description" },
    { id: 'bylaw', icon: BookOpen, label: isAr ? "اللائحة الدراسية" : "Regulations (Bylaw)" },
    { id: 'files', icon: FileText, label: isAr ? "الملفات والوثائق" : "Files & Documents" },
  ];

  return (
    <div className="min-h-screen text-start font-sans transition-colors duration-300 flex flex-col justify-between bg-background text-foreground">

      {/* Shared Header Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 w-full space-y-6">

        {/* Back Button */}
        <button
          onClick={() => navigate('/programs')}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          {isAr ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          {isAr ? "العودة إلى البرامج الأكاديمية" : "Back to Academic Programs"}
        </button>

        {/* Program Header Banner */}
        <SectionCard bodyClassName="p-5 md:p-6">
          <div className="space-y-3">
            <StatusBadge variant="accent">
              {isAr ? program.facultyAr : program.facultyEn}
            </StatusBadge>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-foreground">
              {isAr ? program.titleAr : program.titleEn}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-muted-foreground" />
                <span>{isAr ? "مدة الدراسة:" : "Duration:"} {isAr ? program.durationAr : program.durationEn}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="size-4 text-primary" />
                <span>{isAr ? "المصروفات السنوية:" : "Tuition:"} {program.fees} {isAr ? "جنيه مصري" : "EGP"}</span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Tab Selection Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Main Display Box (Col 8) */}
          <div className="lg:col-span-8">
            <SectionCard bodyClassName="p-5 md:p-6 min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'description' && (
                  <motion.div
                    key="description"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-5 text-start"
                  >
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Info className="size-5 text-primary" />
                      {currentDesc.title}
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentDesc.content}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-border">
                      <h3 className="text-sm font-medium text-foreground">{isAr ? "أهداف البرنامج الأساسية:" : "Program Core Goals:"}</h3>
                      <ul className="space-y-3">
                        {currentDesc.points.map((pt, index) => (
                          <li key={pt?.id || index} className="text-sm text-muted-foreground flex items-start gap-3">
                            <span className="size-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-5 text-start"
                  >
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <BookOpen className="size-5 text-primary" />
                      {currentBylaw.title}
                    </h2>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentBylaw.content}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-border">
                      <h3 className="text-sm font-medium text-foreground">{isAr ? "أهم بنود اللائحة:" : "Key Regulations:"}</h3>
                      <ul className="space-y-3">
                        {currentBylaw.points.map((pt, index) => (
                          <li key={pt?.id || index} className="text-sm text-muted-foreground flex items-start gap-3">
                            <span className="size-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
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
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-5 text-start"
                  >
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <FileText className="size-5 text-primary" />
                      {currentFiles.title}
                    </h2>

                    <EmptyState
                      icon={FileText}
                      title={isAr ? "لا توجد ملفات مرفقة حالياً" : "No Attached Files Currently"}
                      description={isAr ? "لم يتم إرفاق أي لوائح أو ملفات تعريفية خاصة بهذا البرنامج الأكاديمي في الوقت الحالي." : "No bylaws, booklets, or regulatory documents are currently available for this academic program."}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </SectionCard>
          </div>

          {/* Sidebar Tab Menu (Col 4) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <SectionCard bodyClassName="p-2">
              <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-sm font-medium px-3 py-2.5 rounded-md flex items-center justify-between gap-3 transition-colors flex-shrink-0 lg:flex-shrink outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`size-4 ${isActive ? 'text-primary' : ''}`} />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className={`size-4 hidden lg:block text-muted-foreground ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </div>

        </div>

      </main>

      {/* Shared Footer */}
      <Footer />

    </div>
  );
}
