import React from 'react';
import { BookOpen, GraduationCap, Users, ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
import { NavTabId } from './PortalHeader';

interface HubPlaceholderViewProps {
  hubId: NavTabId;
  onReturnToCompany: () => void;
}

const HUB_META: Record<
  Exclude<NavTabId, 'our-company'>,
  {
    title: string;
    description: string;
    icon: React.ElementType;
    upcomingModules: string[];
    phase: string;
  }
> = {
  'product-knowledge': {
    title: 'Product Knowledge Hub',
    description:
      'The comprehensive knowledge repository for KBZLife Insurance products, policy underwriting guidelines, policyholder benefits, and claims procedures.',
    icon: BookOpen,
    upcomingModules: [
      'Term Life & Whole Life Policy Master Guides',
      'Endowment & Education Savings Products',
      'Group Life & Commercial Risk Underwriting',
      'Policyholder Benefit Schedules & Exclusions',
    ],
    phase: 'Phase 2 Architecture',
  },
  'learning-dev': {
    title: 'Learning & Development Hub',
    description:
      'The central academy for employee onboarding, compliance certifications, actuarial foundations, leadership training, and career progression.',
    icon: GraduationCap,
    upcomingModules: [
      'New Employee Induction & Ethics Certification',
      'Insurance Regulatory & AML/CFT Compliance',
      'Customer Consultation & Advisory Mastery',
      'Leadership & Branch Management Tracks',
    ],
    phase: 'Phase 3 Architecture',
  },
  'company-bulletin': {
    title: 'Company Bulletin',
    description:
      'Official corporate announcements, nationwide campaigns, and policy notices for all KBZLife employees.',
    icon: Users,
    upcomingModules: [
      'Nationwide Sales Campaigns',
      'Compliance & AML/CFT Directives',
      'Frontline Operations Notices',
      'Corporate Gazette & Memorandums',
    ],
    phase: 'Active Feature',
  },
};

export const HubPlaceholderView: React.FC<HubPlaceholderViewProps> = ({
  hubId,
  onReturnToCompany,
}) => {
  if (hubId === 'our-company') return null;

  const info = HUB_META[hubId];
  const IconComponent = info.icon;

  return (
    <div className="py-16 sm:py-24 bg-light-blue-pattern min-h-[60vh] flex items-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 sm:p-12">
          {/* Phase Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#003366]/10 text-[#003366] mb-6">
            <Clock className="w-3.5 h-3.5 text-[#00529B]" />
            <span>{info.phase} · Coming Soon</span>
          </div>

          {/* Large Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#00529B]/10 text-[#00529B] flex items-center justify-center mx-auto mb-6 shadow-2xs">
            <IconComponent className="w-8 h-8 stroke-[1.75]" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight mb-3">
            {info.title}
          </h1>

          <p className="text-base text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
            {info.description}
          </p>

          {/* Planned modules card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 text-left max-w-lg mx-auto mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Planned Scope for Next Phase:
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {info.upcomingModules.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00529B] mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Notice & Back Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onReturnToCompany}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#003366] hover:bg-[#00529B] text-white text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Our Company (Page 1)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
