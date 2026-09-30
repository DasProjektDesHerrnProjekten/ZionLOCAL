import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  LogOut,
  Calculator,
  BookOpen,
  Clock,
  Download,
  TrendingUp,
  Award,
  Calendar,
  Languages,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubjectCard, AssessmentBreakdown } from "@/components/scholarsphere/SubjectCard";
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';

const ScholarSphereDashboard = () => {
  const navigate = useNavigate();
  const { student, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!student) {
      navigate('/login');
    }
  }, [student, navigate]);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Use student name from auth context
  const displayName = student.name?.split(' ')[0] || 'Student';

  // Mock assessment data - in a real app this would come from the student's records
  const englishBreakdown: AssessmentBreakdown = {
    test1: 12, test2: 13, quiz1: 8, quiz2: 9, midterm: 18, final: 22, extras: 4
  };

  const mathBreakdown: AssessmentBreakdown = {
    test1: 11, test2: 12, quiz1: 7, quiz2: 8, midterm: 16, final: 20, extras: 3
  };

  const historyBreakdown: AssessmentBreakdown = {
    test1: 9, test2: 10, quiz1: 6, quiz2: 7, midterm: 14, final: 18, extras: 2
  };

  // Calculate totals
  const getSubjectTotal = (breakdown: AssessmentBreakdown) =>
    Object.values(breakdown).reduce((a, b) => a + b, 0);

  const englishTotal = getSubjectTotal(englishBreakdown);
  const mathTotal = getSubjectTotal(mathBreakdown);
  const historyTotal = getSubjectTotal(historyBreakdown);
  const averageScore = Math.round((englishTotal + mathTotal + historyTotal) / 3);

  const handleDownloadOfficial = () => {
    toast.success("Official Transcript Downloaded", {
      description: "Your certified official transcript has been saved.",
    });
  };

  const handleDownloadDetailed = () => {
    toast.success("Detailed Report Downloaded", {
      description: "Your detailed assessment breakdown has been saved.",
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to ZionianApp
              </button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">ZionianPortal</h1>
                <p className="text-sm text-muted-foreground">{student.admission_id}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome to <span className="text-gradient">ZionianPortal</span>
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Academic Year 2025-2026 • Semester 1
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold text-foreground">{averageScore} / 100</p>
            </div>
          </div>
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10">
              <Award className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Class Rank</p>
              <p className="text-lg font-medium text-muted-foreground">Not yet calculated</p>
            </div>
          </div>
        </motion.div>

        {/* Subject Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Subject Results
          </h3>
          <p className="text-sm text-muted-foreground mb-4">Click on a subject to view detailed assessment breakdown</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SubjectCard
              subject="English"
              breakdown={englishBreakdown}
              icon={Languages}
              studentData={student}
            />
            <SubjectCard
              subject="Mathematics"
              breakdown={mathBreakdown}
              icon={Calculator}
              studentData={student}
            />
            <SubjectCard
              subject="History"
              breakdown={historyBreakdown}
              icon={BookOpen}
              studentData={student}
            />
          </div>
        </motion.div>

        {/* Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Official Transcript */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Official Transcript
                </h3>
                <p className="text-sm text-muted-foreground">
                  Certified academic record with official grades and seal
                </p>
              </div>
            </div>
            <Button
              onClick={handleDownloadOfficial}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 rounded-xl animate-pulse-glow"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Official Transcript
            </Button>
          </div>

          {/* Detailed Breakdown */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-secondary">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Detailed Breakdown Report
                </h3>
                <p className="text-sm text-muted-foreground">
                  Complete assessment details with all test and quiz scores
                </p>
              </div>
            </div>
            <Button
              onClick={handleDownloadDetailed}
              variant="outline"
              className="w-full border-border font-medium h-12 rounded-xl hover:bg-secondary"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Detailed Report
            </Button>
          </div>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default ScholarSphereDashboard;
