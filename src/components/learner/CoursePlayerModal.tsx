import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  Award,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { Course } from '../../types/lms';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

interface CoursePlayerModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

export const CoursePlayerModal: React.FC<CoursePlayerModalProps> = ({
  course,
  isOpen,
  onClose,
}) => {
  useBodyScrollLock(isOpen);
  const { currentUser, getUserProgress, recordProgress, getUserEnrollments } = useLms();

  if (!isOpen) return null;

  // Security check: Verify enrollment and active account
  const enrollments = getUserEnrollments(currentUser.id);
  const enrollment = enrollments.find((e) => e.course_id === course.id && e.status === 'enrolled');
  const isSuspended = currentUser.account_status === 'suspended';

  if (isSuspended || (!enrollment && currentUser.role !== 'admin')) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Access Restricted</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isSuspended
              ? 'Your account is currently suspended. You cannot access course materials until an administrator reactivates your account.'
              : 'You do not have an active enrollment record for this course.'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const progress = getUserProgress(currentUser.id, course.id);
  const completedModules = progress?.completed_modules || [];

  // Generate modules list
  const totalModules = course.modules_count || 6;
  const mockModules = Array.from({ length: totalModules }, (_, i) => ({
    id: `mod_${i + 1}`,
    title: `Module ${i + 1}: ${
      i === 0
        ? 'Introduction & Operational Overview'
        : i === 1
        ? 'Underwriting Guidelines & Protocols'
        : i === 2
        ? 'Advisory Standards & Policy Terms'
        : i === 3
        ? 'Compliance, AML & Regulatory Verification'
        : i === 4
        ? 'Case Studies & Practical Applications'
        : 'Assessment & Certification Review'
    }`,
    duration: `${Math.round(((course.duration_hours || 4) / totalModules) * 60)} mins`,
  }));

  const handleToggleModule = async (moduleTitle: string) => {
    const isCompleted = completedModules.includes(moduleTitle);
    const newCompleted = isCompleted
      ? completedModules.filter((m) => m !== moduleTitle)
      : [...completedModules, moduleTitle];

    const newPercentage = Math.round((newCompleted.length / totalModules) * 100);
    const newStatus =
      newPercentage >= 100 ? 'completed' : newPercentage > 0 ? 'in_progress' : 'not_started';

    await recordProgress(course.id, undefined, newPercentage, newStatus, moduleTitle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#10243C] rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-[#1E426D] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#003366] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sky-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                {course.category}
              </span>
              <h2 className="text-base sm:text-lg font-bold leading-tight">{course.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-lg text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-200">
          {/* Progress Banner */}
          <div className="bg-slate-50 dark:bg-[#122842] p-4 rounded-2xl border border-slate-200 dark:border-[#1E426D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-400 tracking-wider">
                Learning Progress
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-extrabold text-[#003366] dark:text-[#38BDF8]">
                  {progress?.progress_percentage || 0}%
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  ({completedModules.length} of {totalModules} modules completed)
                </span>
              </div>
            </div>

            <div className="w-full sm:w-48 bg-slate-200 dark:bg-[#0E1F33] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress?.progress_percentage || 0}%` }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-1">
              Course Overview & Objectives
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{course.description}</p>
          </div>

          {/* Modules Checklist */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
              Curriculum Modules & Verification
            </h4>

            <div className="space-y-2">
              {mockModules.map((mod) => {
                const isCompleted = completedModules.includes(mod.title);

                return (
                  <div
                    key={mod.id}
                    onClick={() => handleToggleModule(mod.title)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isCompleted
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-[#122842] border-slate-200 dark:border-[#1E426D] hover:border-sky-300 dark:hover:border-[#38BDF8]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600 text-transparent hover:border-[#00529B] dark:hover:border-[#38BDF8]'
                        }`}
                      >
                        ✓
                      </div>
                      <div>
                        <p className={`font-bold text-xs ${isCompleted ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-80' : 'text-slate-900 dark:text-slate-100'}`}>
                          {mod.title}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{mod.duration}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                        isCompleted
                          ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                          : 'text-[#00529B] dark:text-[#38BDF8] bg-sky-50 dark:bg-[#153252] hover:bg-sky-100 dark:hover:bg-[#183B60]'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Mark Complete'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#0E2035] border-t border-slate-100 dark:border-[#1E426D] flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Progress updates are automatically saved to Supabase learning_progress
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#003366] text-white font-bold hover:bg-[#00529B] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
