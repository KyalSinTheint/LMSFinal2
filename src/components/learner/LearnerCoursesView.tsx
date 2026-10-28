import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  Lock,
  ShieldAlert,
  Search,
  Sparkles,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { Course } from '../../types/lms';
import { CoursePlayerModal } from './CoursePlayerModal';

export const LearnerCoursesView: React.FC = () => {
  const { currentUser, getUserAccessibleCourses, getUserProgress } = useLms();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourseForPlayer, setActiveCourseForPlayer] = useState<Course | null>(null);

  const accessibleCourses = getUserAccessibleCourses(currentUser.id);

  // Security check: If account is suspended
  if (currentUser.account_status === 'suspended') {
    return (
      <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-8 text-center max-w-xl mx-auto space-y-4 my-8">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          LMS Learning Access Suspended
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your employee account (<span className="font-semibold text-slate-800">{currentUser.email}</span>) is currently marked as <strong className="text-red-600">SUSPENDED</strong> in the Supabase database. Protected curriculum modules and exams are inaccessible until reactivated by an administrator.
        </p>
      </div>
    );
  }

  const filtered = accessibleCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#00529B] dark:text-[#38BDF8]" />
            <span>My Authorized Courses ({accessibleCourses.length})</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Curriculum modules assigned to your profile in the central Supabase LMS database.
          </p>
        </div>

        {accessibleCourses.length > 0 && (
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your courses..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#1E426D] focus:outline-none focus:ring-2 focus:ring-[#00529B] bg-white dark:bg-[#122842] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      {/* Courses Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#10243C] rounded-3xl border border-slate-200/80 dark:border-[#1E426D] shadow-2xs p-8 text-center max-w-xl mx-auto space-y-4 my-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#153252] text-slate-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Courses Available</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {accessibleCourses.length === 0
              ? 'You do not have any active course enrollments assigned. Contact the LMS Administrator or check back after orientation.'
              : 'No courses match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => {
            const progress = getUserProgress(currentUser.id, course.id);
            const percentage = progress?.progress_percentage || 0;
            const isCompleted = percentage >= 100;

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200/80 dark:border-[#1E426D] shadow-2xs overflow-hidden flex flex-col justify-between hover:border-sky-300 dark:hover:border-[#38BDF8] transition-all hover:shadow-md"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-[#0E2035]">
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#003366]/90 text-white backdrop-blur-xs">
                        {course.category}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium flex items-center gap-1 backdrop-blur-xs">
                      <Clock className="w-3 h-3 text-sky-300" />
                      <span>{course.duration_hours || 4}h</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
                        <span className="font-bold text-[#003366] dark:text-[#38BDF8]">{percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#0E1F33] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-[#00529B]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#0E2035] border-t border-slate-100 dark:border-[#1E426D] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {course.modules_count || 6} Modules
                  </span>

                  <button
                    onClick={() => setActiveCourseForPlayer(course)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#00529B] text-white font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{percentage > 0 ? (isCompleted ? 'Review' : 'Continue') : 'Start Course'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Player Modal */}
      {activeCourseForPlayer && (
        <CoursePlayerModal
          course={activeCourseForPlayer}
          isOpen={true}
          onClose={() => setActiveCourseForPlayer(null)}
        />
      )}
    </div>
  );
};
