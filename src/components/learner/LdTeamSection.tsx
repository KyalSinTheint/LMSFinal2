import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { LdTeamMember, LdMemberType } from '../../types/lms';
import { Quote, Users, Sparkles, GraduationCap, Briefcase, Building2, User } from 'lucide-react';

export const LdTeamSection: React.FC = () => {
  const { getPublishedHodMotto, getPublishedTeamMembers } = useLms();
  const hodMotto = getPublishedHodMotto();
  const publishedMembers = getPublishedTeamMembers();

  const [activeFilter, setActiveFilter] = useState<'all' | LdMemberType>('all');

  const teamMembersOnly = publishedMembers.filter((m) => m.member_type === 'team_member');
  const internsOnly = publishedMembers.filter((m) => m.member_type === 'intern');

  const displayedMembers =
    activeFilter === 'all'
      ? publishedMembers
      : publishedMembers.filter((m) => m.member_type === activeFilter);

  return (
    <div className="space-y-16">
      {/* 1. HOD MOTTO (If published and provided) */}
      {hodMotto && hodMotto.motto_text.trim() && (
        <section aria-labelledby="hod-motto-heading" className="w-full">
          {/* Section Heading */}
          <div className="max-w-3xl mb-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#176B98]/10 dark:bg-[#153252] text-[#176B98] dark:text-[#38bdf8] text-xs font-bold tracking-wide mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38bdf8]" />
              <span>Leadership Guidance · Learning & Development</span>
            </div>
            <h2
              id="hod-motto-heading"
              className="text-2xl sm:text-3xl font-extrabold text-[#176B98] dark:text-[#38bdf8] tracking-tight"
            >
              Head of Department (HOD) Motto
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {hodMotto.statement_context ||
                'Guiding principles for employee talent capability, ethical compliance, and career progression.'}
            </p>
          </div>

          {/* Motto Card matching CeoMottoSection visual aesthetic */}
          <div className="bg-white dark:bg-[#10243C] rounded-3xl border border-slate-200 dark:border-[#1E426D] overflow-hidden shadow-card-elevated hover:shadow-card-hover transition-all">
            <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
              {/* HOD Portrait Column (4 cols on md) */}
              <div className="md:col-span-4 bg-[#F3F8FB] dark:bg-[#0E2035] flex flex-col justify-center p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#1E426D]">
                <div className="w-full max-w-xs mx-auto">
                  <div className="relative aspect-4/5 rounded-2xl overflow-hidden shadow-sm border border-slate-200/90 dark:border-[#1E426D] bg-slate-100 dark:bg-[#153252]">
                    {hodMotto.photo_url ? (
                      <img
                        src={hodMotto.photo_url}
                        alt={hodMotto.hod_name || 'Head of Learning & Development'}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#F3F8FB] dark:bg-[#0E2035] text-[#176B98] dark:text-[#38bdf8]">
                        <User className="w-16 h-16 opacity-40 mb-2" />
                        <span className="text-xs font-bold">KBZLife Leadership</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 text-center">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                      {hodMotto.hod_name || 'Head of Department'}
                    </h3>
                    <p className="text-xs text-[#176B98] dark:text-[#38bdf8] font-semibold mt-0.5">
                      {hodMotto.hod_title || 'Head of Learning & Development'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quotation Panel Column (8 cols on md) */}
              <div className="md:col-span-8 p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative bg-white dark:bg-[#10243C]">
                <Quote
                  className="w-20 h-20 text-[#176B98]/5 dark:text-[#38bdf8]/5 absolute top-6 right-6 pointer-events-none"
                  aria-hidden="true"
                />

                <div className="space-y-6 relative z-10 text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#176B98]/10 dark:bg-[#153252] text-[#176B98] dark:text-[#38bdf8] text-xs font-bold shadow-2xs">
                    <Quote className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38bdf8]" />
                    <span>Cultivating Talent & Potential</span>
                  </div>

                  <blockquote className="text-lg sm:text-xl lg:text-2xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed tracking-tight whitespace-pre-line text-left">
                    {hodMotto.motto_text}
                  </blockquote>
                </div>

                {/* Attribution and note */}
                <div className="pt-8 mt-8 border-t border-slate-200 dark:border-[#1E426D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#737373] dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {hodMotto.hod_name || 'Daw Khin Thida'}
                    </span>
                    {hodMotto.hod_title && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-slate-600 dark:text-slate-400">{hodMotto.hod_title}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. TEAM MEMBERS SECTION */}
      <section aria-labelledby="team-members-heading" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-[#1E426D]">
          <div className="text-left space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#176B98]/10 dark:bg-[#153252] text-[#176B98] dark:text-[#38bdf8] text-xs font-bold tracking-wide">
              <Users className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38bdf8]" />
              <span>Dedicated People & Mentors</span>
            </div>
            <h2
              id="team-members-heading"
              className="text-2xl sm:text-3xl font-extrabold text-[#176B98] dark:text-[#38bdf8] tracking-tight"
            >
              Our L&D Team & Interns
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Meet the educators, instructional designers, trainers, and emerging interns who drive corporate capability and curriculum excellence at KBZLife Insurance.
            </p>
          </div>

          {/* Filtering Chips: All / Team Members / Interns */}
          <div className="flex items-center gap-2 shrink-0 bg-white dark:bg-[#10243C] p-1 rounded-xl border border-slate-200 dark:border-[#1E426D] shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#153252]'
              }`}
            >
              All ({publishedMembers.length})
            </button>
            <button
              onClick={() => setActiveFilter('team_member')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'team_member'
                  ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#153252]'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Team Members ({teamMembersOnly.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('intern')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'intern'
                  ? 'bg-[#176B98] dark:bg-[#1A73A7] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#153252]'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Interns ({internsOnly.length})</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {displayedMembers.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200 dark:border-[#1E426D] max-w-md mx-auto">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No team members listed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeFilter === 'intern'
                ? 'No interns are currently published in this view.'
                : 'No team members are published yet.'}
            </p>
          </div>
        ) : (
          /* Responsive Team Member Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {displayedMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white dark:bg-[#10243C] rounded-2xl border border-slate-200/90 dark:border-[#1E426D] shadow-card-elevated hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1 text-left min-w-0"
              >
                {/* Photo Container */}
                <div className="relative aspect-4/5 overflow-hidden bg-slate-100 dark:bg-[#0E2035] border-b border-slate-100 dark:border-[#1E426D]">
                  {member.photo_url || member.photo_path ? (
                    <img
                      src={member.photo_url || member.photo_path}
                      alt={member.full_name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#F3F8FB] dark:bg-[#0E2035] text-[#176B98] dark:text-[#38bdf8]">
                      <div className="w-16 h-16 rounded-full bg-[#176B98]/10 dark:bg-[#153252] flex items-center justify-center font-bold text-lg">
                        {member.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* Member Type Pill Tag */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs backdrop-blur-xs flex items-center gap-1 ${
                        member.member_type === 'intern'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-[#176B98]/90 text-white'
                      }`}
                    >
                      {member.member_type === 'intern' ? (
                        <>
                          <GraduationCap className="w-3 h-3" />
                          <span>Intern</span>
                        </>
                      ) : (
                        <>
                          <Briefcase className="w-3 h-3" />
                          <span>Team Member</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 min-w-0">
                  <div>
                    <h3 className="text-base font-extrabold text-[#176B98] dark:text-[#38bdf8] tracking-tight group-hover:text-[#135A80] dark:group-hover:text-[#7dd3fc] transition-colors break-words">
                      {member.full_name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 break-words leading-relaxed">
                      {member.position}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-[#1E426D] flex items-center gap-1.5 text-[11px] text-[#737373] dark:text-slate-400 min-w-0">
                    <Building2 className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38bdf8] shrink-0" />
                    <span className="truncate">{member.department || 'Learning & Development'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
