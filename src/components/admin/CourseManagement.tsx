import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  UserPlus,
  Calendar,
  Layers,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { Course } from '../../types/lms';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

export const CourseManagement: React.FC = () => {
  const {
    courses,
    profiles,
    courseEnrollments,
    createCourse,
    updateCourse,
    deleteCourse,
    assignCourse,
    revokeCourse,
  } = useLms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseForEnrollments, setSelectedCourseForEnrollments] = useState<Course | null>(null);

  // Edit / Create course modal state
  const [courseModal, setCourseModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    courseId?: string;
    title: string;
    description: string;
    thumbnail_url: string;
    category: string;
    duration_hours: number;
    modules_count: number;
    published: boolean;
    outcomesText: string;
  }>({
    isOpen: false,
    isEditing: false,
    title: '',
    description: '',
    thumbnail_url: '',
    category: 'Underwriting & Actuarial',
    duration_hours: 4.5,
    modules_count: 6,
    published: true,
    outcomesText: '',
  });

  // Assign user to course modal state
  const [assignUserModal, setAssignUserModal] = useState<{
    isOpen: boolean;
    courseId: string;
    selectedUserId: string;
    expiresAt: string;
    note: string;
  }>({
    isOpen: false,
    courseId: '',
    selectedUserId: '',
    expiresAt: '',
    note: '',
  });

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Lock background scroll when any course modal or enrollment drawer is open
  useBodyScrollLock(courseModal.isOpen || assignUserModal.isOpen || !!selectedCourseForEnrollments);

  const handleOpenCreateModal = () => {
    setCourseModal({
      isOpen: true,
      isEditing: false,
      title: '',
      description: '',
      thumbnail_url:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      category: 'Core Curriculum',
      duration_hours: 4.0,
      modules_count: 5,
      published: true,
      outcomesText: 'Understand KBZLife principles\nComply with internal directives',
    });
  };

  const handleOpenEditModal = (course: Course) => {
    setCourseModal({
      isOpen: true,
      isEditing: true,
      courseId: course.id,
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      category: course.category,
      duration_hours: course.duration_hours || 4.0,
      modules_count: course.modules_count || 5,
      published: course.published,
      outcomesText: course.learning_outcomes ? course.learning_outcomes.join('\n') : '',
    });
  };

  const handleSaveCourse = async () => {
    const outcomes = courseModal.outcomesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (courseModal.isEditing && courseModal.courseId) {
      await updateCourse(courseModal.courseId, {
        title: courseModal.title,
        description: courseModal.description,
        thumbnail_url: courseModal.thumbnail_url,
        category: courseModal.category,
        duration_hours: Number(courseModal.duration_hours),
        modules_count: Number(courseModal.modules_count),
        published: courseModal.published,
        learning_outcomes: outcomes,
      });
    } else {
      await createCourse({
        title: courseModal.title,
        description: courseModal.description,
        thumbnail_url: courseModal.thumbnail_url,
        category: courseModal.category,
        duration_hours: Number(courseModal.duration_hours),
        modules_count: Number(courseModal.modules_count),
        published: courseModal.published,
        learning_outcomes: outcomes,
      });
    }
    setCourseModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleTogglePublish = async (course: Course) => {
    await updateCourse(course.id, { published: !course.published });
  };

  const handleAssignUser = async () => {
    if (!assignUserModal.selectedUserId || !assignUserModal.courseId) return;
    await assignCourse(
      assignUserModal.selectedUserId,
      assignUserModal.courseId,
      assignUserModal.expiresAt || null,
      assignUserModal.note
    );
    setAssignUserModal((prev) => ({ ...prev, isOpen: false, note: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#176B98]" />
            <span>Course Catalog & Curriculum Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, edit, publish courses, and manage user enrollment permissions.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search courses by title, category, or syllabus..."
          className="w-full text-xs bg-transparent focus:outline-none"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => {
          const enrollments = courseEnrollments.filter(
            (e) => e.course_id === course.id && e.status === 'enrolled'
          );

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-sky-300 transition-colors"
            >
              <div>
                {/* Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#176B98]/90 text-white backdrop-blur-xs">
                      {course.category}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-xs ${
                        course.published
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-amber-600/90 text-white'
                      }`}
                    >
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-xs">
                    <Clock className="w-3 h-3 text-sky-300" />
                    <span>{course.duration_hours || 4}h · {course.modules_count || 6} Modules</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                      <span className="font-bold text-[10px] uppercase text-slate-400 block tracking-wider">
                        Core Competencies:
                      </span>
                      {course.learning_outcomes.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-[#176B98] font-bold">✓</span>
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                {/* Enrolled counter button */}
                <button
                  onClick={() => setSelectedCourseForEnrollments(course)}
                  className="flex items-center gap-1.5 text-[#176B98] font-bold hover:underline cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>{enrollments.length} Enrolled Learners</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePublish(course)}
                    title={course.published ? 'Unpublish Course' : 'Publish Course'}
                    className={`p-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      course.published
                        ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {course.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(course)}
                    title="Edit Course Information"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete course "${course.title}"?`)) {
                        deleteCourse(course.id);
                      }
                    }}
                    title="Delete Course"
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT COURSE MODAL */}
      {courseModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900">
              {courseModal.isEditing ? 'Edit Course Information' : 'Create New LMS Course'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title</label>
              <input
                type="text"
                value={courseModal.title}
                onChange={(e) => setCourseModal((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Life Insurance Policy Underwriting Mastery"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={courseModal.category}
                onChange={(e) => setCourseModal((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              >
                <option value="Underwriting & Actuarial">Underwriting & Actuarial</option>
                <option value="Compliance & Ethics">Compliance & Ethics</option>
                <option value="Advisory & Customer Care">Advisory & Customer Care</option>
                <option value="Corporate Solutions">Corporate Solutions</option>
                <option value="Product Knowledge">Product Knowledge</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Description</label>
              <textarea
                rows={3}
                value={courseModal.description}
                onChange={(e) => setCourseModal((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed curriculum overview..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={courseModal.duration_hours}
                  onChange={(e) => setCourseModal((prev) => ({ ...prev, duration_hours: parseFloat(e.target.value) || 0 }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Modules</label>
                <input
                  type="number"
                  value={courseModal.modules_count}
                  onChange={(e) => setCourseModal((prev) => ({ ...prev, modules_count: parseInt(e.target.value) || 0 }))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thumbnail Image URL</label>
              <input
                type="text"
                value={courseModal.thumbnail_url}
                onChange={(e) => setCourseModal((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Learning Outcomes (One per line)
              </label>
              <textarea
                rows={3}
                value={courseModal.outcomesText}
                onChange={(e) => setCourseModal((prev) => ({ ...prev, outcomesText: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="course_published"
                checked={courseModal.published}
                onChange={(e) => setCourseModal((prev) => ({ ...prev, published: e.target.checked }))}
                className="rounded border-slate-300 text-[#176B98] focus:ring-[#176B98]"
              />
              <label htmlFor="course_published" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Publish course immediately to authorized learners
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCourseModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCourse}
                disabled={!courseModal.title.trim()}
                className="px-4 py-2 rounded-lg bg-[#176B98] hover:bg-[#12567a] text-white font-semibold text-xs cursor-pointer shadow-xs disabled:opacity-50"
              >
                {courseModal.isEditing ? 'Save Changes' : 'Create Course in Supabase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENROLLED LEARNERS MODAL */}
      {selectedCourseForEnrollments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
            <div className="bg-[#176B98] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Enrolled Users: {selectedCourseForEnrollments.title}</h3>
                <p className="text-xs text-sky-100">Manage learner enrollments, access validity, and revocations</p>
              </div>
              <button
                onClick={() => setSelectedCourseForEnrollments(null)}
                className="text-white/60 hover:text-white p-1 rounded-lg text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Enrolled Students ({courseEnrollments.filter((e) => e.course_id === selectedCourseForEnrollments.id && e.status === 'enrolled').length})
                </span>
                <button
                  onClick={() =>
                    setAssignUserModal({
                      isOpen: true,
                      courseId: selectedCourseForEnrollments.id,
                      selectedUserId: profiles[1]?.id || '',
                      expiresAt: '',
                      note: '',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#176B98] hover:bg-[#12567a] text-white font-semibold cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll New Learner</span>
                </button>
              </div>

              <div className="space-y-2">
                {courseEnrollments
                  .filter((e) => e.course_id === selectedCourseForEnrollments.id)
                  .map((enr) => {
                    const user = profiles.find((p) => p.id === enr.user_id);
                    const isRevoked = enr.status === 'revoked';

                    return (
                      <div
                        key={enr.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isRevoked ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              user?.avatar_url ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'
                            }
                            alt={user?.full_name || 'User'}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{user?.full_name || 'Unknown User'}</p>
                            <p className="text-[11px] text-slate-500">{user?.email}</p>
                            {enr.expires_at && (
                              <p className="text-[10px] text-amber-600 mt-0.5">
                                Expires: {new Date(enr.expires_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          {isRevoked ? (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-100 text-red-700 uppercase">
                              Revoked
                            </span>
                          ) : (
                            <button
                              onClick={() => revokeCourse(enr.user_id, enr.course_id)}
                              className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                            >
                              Revoke Access
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN USER MODAL */}
      {assignUserModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Enroll Learner in Course</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Employee</label>
              <select
                value={assignUserModal.selectedUserId}
                onChange={(e) => setAssignUserModal((prev) => ({ ...prev, selectedUserId: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.email}) - {p.account_status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Access Expiration Date (Optional)</label>
              <input
                type="date"
                value={assignUserModal.expiresAt}
                onChange={(e) => setAssignUserModal((prev) => ({ ...prev, expiresAt: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Note</label>
              <input
                type="text"
                placeholder="e.g. Underwriting team cohort 2026"
                value={assignUserModal.note}
                onChange={(e) => setAssignUserModal((prev) => ({ ...prev, note: e.target.value }))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-[#176B98] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAssignUserModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignUser}
                className="px-4 py-2 rounded-lg bg-[#176B98] hover:bg-[#12567a] text-white font-semibold text-xs cursor-pointer shadow-xs"
              >
                Confirm Enrollment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
