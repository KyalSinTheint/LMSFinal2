import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Shield,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Newspaper,
  Film,
  Award,
  Building2,
  Check,
  User,
  LogOut,
  BookOpen,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react';

import { useLms } from '../context/LmsContext';
import { LearnerProfileModal } from './learner/LearnerProfileModal';

export type NavTabId = 'our-company' | 'product-knowledge' | 'learning-dev' | 'company-bulletin';
export type OurCompanySubpage = 'overview' | 'news' | 'videos' | 'top-performers';
export type LdSubpage = 'overview' | 'license-training' | 'skill-development';

export interface NavItem {
  id: NavTabId;
  label: string;
  isReady: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'our-company', label: 'Our Company', isReady: true },
  { id: 'learning-dev', label: 'Learning and Development Hub', isReady: true },
  { id: 'product-knowledge', label: 'Product Knowledge Hub', isReady: true },
  { id: 'company-bulletin', label: 'Company Bulletin', isReady: true },
];

export const OUR_COMPANY_DROPDOWN_ITEMS: {
  id: OurCompanySubpage;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'overview',
    label: 'Our Company (Overview)',
    description: 'Vision, Mission, Purpose, Core Values & CEO Motto',
    icon: Building2,
  },
  {
    id: 'news',
    label: 'Our Company News',
    description: 'Internal gazette, milestones, and operational updates',
    icon: Newspaper,
  },
  {
    id: 'videos',
    label: 'Company Update Video',
    description: 'Leadership briefings and training videos on YouTube',
    icon: Film,
  },
  {
    id: 'top-performers',
    label: 'Top Performer',
    description: '12-month recognition across Alliance, Bancassurance & Corporate',
    icon: Award,
  },
];

export const LD_DROPDOWN_ITEMS: {
  id: LdSubpage;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'overview',
    label: 'Learning and Development Overview',
    description: 'HOD motto, dedicated trainers & L&D team',
    icon: Sparkles,
  },
  {
    id: 'license-training',
    label: 'License Training',
    description: 'Regulatory accreditation, agent licensing & compliance tracks',
    icon: Award,
  },
  {
    id: 'skill-development',
    label: 'Skill Development',
    description: 'Professional skills, consultative advisory & career growth',
    icon: BookOpen,
  },
];

interface PortalHeaderProps {
  activeTab: NavTabId;
  activeSubpage: OurCompanySubpage;
  activeLdSubpage?: LdSubpage;
  onSelectTab: (tabId: NavTabId, subpage?: string) => void;
  isPlaceholderMode: boolean;
  onTogglePlaceholderMode: () => void;
  onOpenContentEditor: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  activeTab,
  activeSubpage,
  activeLdSubpage = 'overview',
  onSelectTab,
  isPlaceholderMode,
  onTogglePlaceholderMode,
  onOpenContentEditor,
}) => {
  const { currentUser, signOut, theme, toggleTheme } = useLms();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ldDropdownOpen, setLdDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(true);
  const [mobileLdSubmenuOpen, setMobileLdSubmenuOpen] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const ldDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (ldDropdownRef.current && !ldDropdownRef.current.contains(event.target as Node)) {
        setLdDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setLdDropdownOpen(false);
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubpageClick = (subpage: OurCompanySubpage) => {
    onSelectTab('our-company', subpage);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLdSubpageClick = (subpage: LdSubpage) => {
    onSelectTab('learning-dev', subpage);
    setLdDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0E2035]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E426D] shadow-xs transition-colors">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-8 h-18">
          {/* Zone 1: Brand Wordmark & Official Logo slot */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <button
              onClick={() => onSelectTab('our-company', 'overview')}
              className="flex items-center gap-2 sm:gap-3 text-left group focus-visible:ring-2 focus-visible:ring-[#176B98] rounded-lg p-1 transition-transform cursor-pointer"
              aria-label="KBZLIFE Employee Learning Portal Home"
            >
              <img
                src="/assets/aistudio/KBZ_Logo_28e9d8fb.png"
                alt="KBZ LIFE Insurance"
                className="h-9 sm:h-11 w-auto object-contain"
              />
              <div className="flex flex-col border-l border-slate-200 dark:border-slate-700 pl-2 sm:pl-3">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#176B98] dark:text-[#38bdf8] leading-none truncate">
                  KBZ LIFE Insurance
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-[#737373] dark:text-slate-400 uppercase mt-0.5">
                  Employee Learning Portal
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Desktop) with Dropdowns */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2 h-full"
            aria-label="Main Navigation"
          >
            {/* Tab 1: Our Company with Interactive Dropdown */}
            <div
              ref={dropdownRef}
              className="relative h-full flex items-center"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                aria-current={activeTab === 'our-company' ? 'page' : undefined}
                className={`relative px-3 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#176B98] ${
                  activeTab === 'our-company'
                    ? 'text-[#176B98] dark:text-[#38bdf8] bg-[#F3F8FB] dark:bg-[#10243C]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8] hover:bg-slate-50 dark:hover:bg-[#10243C]/60'
                }`}
              >
                <span>Our Company</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#737373] dark:text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-[#176B98] dark:text-[#38bdf8]' : ''
                  }`}
                />
                {activeTab === 'our-company' && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#176B98] dark:bg-[#38bdf8] rounded-full"
                    aria-hidden="true"
                  />
                )}
              </button>

              {/* Desktop Dropdown Menu Menu Popover */}
              {dropdownOpen && (
                <div
                  className="absolute top-full left-0 w-80 bg-white dark:bg-[#10243C] rounded-xl shadow-xl border border-slate-200 dark:border-[#1E426D] py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-[#1E426D] mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B98] dark:text-[#38bdf8]">
                      Our Company Sections
                    </span>
                  </div>

                  {OUR_COMPANY_DROPDOWN_ITEMS.map((item) => {
                    const isSubpageActive =
                      activeTab === 'our-company' && activeSubpage === item.id;
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSubpageClick(item.id)}
                        className={`w-full px-3.5 py-2.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                          isSubpageActive
                            ? 'bg-[#F3F8FB] dark:bg-slate-800 text-[#176B98] dark:text-[#38bdf8]'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
                        }`}
                        role="menuitem"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSubpageActive
                              ? 'bg-[#176B98] text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-[#737373] dark:text-slate-400'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold truncate block ${
                                isSubpageActive ? 'text-[#176B98] dark:text-[#38bdf8]' : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {item.label}
                            </span>
                            {isSubpageActive && (
                              <Check className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38bdf8] shrink-0" />
                            )}
                          </div>
                          <span className="text-[11px] text-[#737373] dark:text-slate-400 line-clamp-1 mt-0.5 block">
                            {item.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tab 2: Learning and Development Hub with Interactive Dropdown (Matching Our Company) */}
            <div
              ref={ldDropdownRef}
              className="relative h-full flex items-center"
              onMouseEnter={() => setLdDropdownOpen(true)}
              onMouseLeave={() => setLdDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setLdDropdownOpen(!ldDropdownOpen)}
                aria-expanded={ldDropdownOpen}
                aria-haspopup="true"
                aria-current={activeTab === 'learning-dev' ? 'page' : undefined}
                className={`relative px-3 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#176B98] ${
                  activeTab === 'learning-dev'
                    ? 'text-[#176B98] dark:text-[#38bdf8] bg-[#F3F8FB] dark:bg-[#10243C]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8] hover:bg-slate-50 dark:hover:bg-[#10243C]/60'
                }`}
              >
                <span>Learning and Development Hub</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#737373] dark:text-slate-400 transition-transform duration-200 ${
                    ldDropdownOpen ? 'rotate-180 text-[#176B98] dark:text-[#38bdf8]' : ''
                  }`}
                />
                {activeTab === 'learning-dev' && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#176B98] dark:bg-[#38bdf8] rounded-full"
                    aria-hidden="true"
                  />
                )}
              </button>

              {/* L&D Dropdown Menu Popover */}
              {ldDropdownOpen && (
                <div
                  className="absolute top-full left-0 w-80 bg-white dark:bg-[#10243C] rounded-xl shadow-xl border border-slate-200 dark:border-[#1E426D] py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-[#1E426D] mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#176B98] dark:text-[#38bdf8]">
                      L&D Hub Modules
                    </span>
                  </div>

                  {LD_DROPDOWN_ITEMS.map((item) => {
                    const isSubpageActive =
                      activeTab === 'learning-dev' && activeLdSubpage === item.id;
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleLdSubpageClick(item.id)}
                        className={`w-full px-3.5 py-2.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                          isSubpageActive
                            ? 'bg-[#F3F8FB] dark:bg-[#153252] text-[#176B98] dark:text-[#38bdf8]'
                            : 'hover:bg-slate-50 dark:hover:bg-[#153252]/60 text-slate-700 dark:text-slate-200'
                        }`}
                        role="menuitem"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSubpageActive
                              ? 'bg-[#176B98] text-white'
                              : 'bg-slate-100 dark:bg-[#153252] text-[#737373] dark:text-slate-400'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold truncate block ${
                                isSubpageActive ? 'text-[#176B98] dark:text-[#38bdf8]' : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {item.label}
                            </span>
                            {isSubpageActive && (
                              <Check className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38bdf8] shrink-0" />
                            )}
                          </div>
                          <span className="text-[11px] text-[#737373] dark:text-slate-400 line-clamp-1 mt-0.5 block">
                            {item.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tab 3: Product Knowledge Hub */}
            <button
              onClick={() => onSelectTab('product-knowledge')}
              aria-current={activeTab === 'product-knowledge' ? 'page' : undefined}
              className={`relative px-3 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'product-knowledge'
                  ? 'text-[#176B98] dark:text-[#38bdf8] bg-[#F3F8FB] dark:bg-[#10243C]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8] hover:bg-slate-50 dark:hover:bg-[#10243C]/60'
              }`}
            >
              <span>Product Knowledge Hub</span>
              {activeTab === 'product-knowledge' && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#176B98] dark:bg-[#38bdf8] rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>

            {/* Tab 4: Company Bulletin */}
            <button
              onClick={() => onSelectTab('company-bulletin')}
              aria-current={activeTab === 'company-bulletin' ? 'page' : undefined}
              className={`relative px-3 py-2 text-sm font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'company-bulletin'
                  ? 'text-[#176B98] dark:text-[#38bdf8] bg-[#F3F8FB] dark:bg-[#10243C]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8] hover:bg-slate-50 dark:hover:bg-[#10243C]/60'
              }`}
            >
              <span>Company Bulletin</span>
              {activeTab === 'company-bulletin' && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#176B98] dark:bg-[#38bdf8] rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Action & Profile Switcher & Theme Switcher */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {/* Dark / Light Mode Toggle (Desktop) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg border border-slate-200 dark:border-[#1E426D] bg-white dark:bg-[#10243C] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#153252] transition-colors cursor-pointer shadow-2xs flex items-center justify-center"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Account Menu (Strict Regular User Session) */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E426D] bg-white dark:bg-[#10243C] hover:bg-slate-50 dark:hover:bg-[#153252] transition-colors cursor-pointer text-left"
                title="Account menu"
              >
                <img
                  src={
                    currentUser.avatar_url ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80'
                  }
                  alt={currentUser.full_name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="hidden xl:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[120px]">
                    {currentUser.full_name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                    {currentUser.department || 'Employee'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#10243C] rounded-2xl shadow-xl border border-slate-200 dark:border-[#1E426D] py-2 z-50 text-slate-800 dark:text-slate-100 text-xs">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-[#1E426D] flex items-center gap-3">
                    <img
                      src={
                        currentUser.avatar_url ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80'
                      }
                      alt={currentUser.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser.full_name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-[#F3F8FB] dark:bg-slate-800 text-[#176B98] dark:text-[#38bdf8] border border-[#176B98]/20 dark:border-slate-700">
                        {currentUser.employee_id || 'Active Learner'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 mt-1 px-2 space-y-1">
                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-[#176B98] dark:text-[#38bdf8]" />
                      <span>My Employee Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:text-[#176B98] dark:hover:text-[#38bdf8] hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#176B98] cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation with Expandable Submenus */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-[#1E426D] bg-white dark:bg-[#10243C] px-4 pt-3 pb-6 shadow-xl transition-all text-left">
          <div className="space-y-2" role="menu">
            {/* 1. Our Company Expandable Section */}
            <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)}
                className="w-full flex items-center justify-between p-3 text-sm font-bold text-[#176B98] dark:text-[#38bdf8] bg-white dark:bg-slate-800 cursor-pointer"
              >
                <span>1. Our Company</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#737373] dark:text-slate-400 transition-transform ${
                    mobileSubmenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileSubmenuOpen && (
                <div className="p-2 space-y-1 bg-[#F8FAFC] dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                  {OUR_COMPANY_DROPDOWN_ITEMS.map((item) => {
                    const isSubActive =
                      activeTab === 'our-company' && activeSubpage === item.id;
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSubpageClick(item.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-md text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                          isSubActive
                            ? 'bg-[#176B98] text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {isSubActive && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Learning and Development Hub Expandable Section */}
            <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setMobileLdSubmenuOpen(!mobileLdSubmenuOpen)}
                className="w-full flex items-center justify-between p-3 text-sm font-bold text-[#176B98] dark:text-[#38bdf8] bg-white dark:bg-slate-800 cursor-pointer"
              >
                <span>2. Learning and Development Hub</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#737373] dark:text-slate-400 transition-transform ${
                    mobileLdSubmenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileLdSubmenuOpen && (
                <div className="p-2 space-y-1 bg-[#F8FAFC] dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                  {LD_DROPDOWN_ITEMS.map((item) => {
                    const isSubActive =
                      activeTab === 'learning-dev' && activeLdSubpage === item.id;
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleLdSubpageClick(item.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-md text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                          isSubActive
                            ? 'bg-[#176B98] text-white shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {isSubActive && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Product Knowledge Hub */}
            <button
              onClick={() => {
                onSelectTab('product-knowledge');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${
                activeTab === 'product-knowledge'
                  ? 'bg-[#176B98] text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              role="menuitem"
            >
              <span>3. Product Knowledge Hub</span>
            </button>

            {/* 4. Company Bulletin */}
            <button
              onClick={() => {
                onSelectTab('company-bulletin');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between ${
                activeTab === 'company-bulletin'
                  ? 'bg-[#176B98] text-white shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              role="menuitem"
            >
              <span>4. Company Bulletin</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            {/* Mobile Learner Account Card */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
              <img
                src={
                  currentUser.avatar_url ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80'
                }
                alt={currentUser.full_name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">{currentUser.full_name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[9px] font-bold uppercase bg-[#F3F8FB] dark:bg-slate-700 text-[#176B98] dark:text-[#38bdf8] border border-[#176B98]/20 dark:border-slate-600">
                  {currentUser.department || 'Active Learner'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsProfileModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-4 text-xs font-bold text-[#176B98] dark:text-[#38bdf8] bg-[#F3F8FB] dark:bg-slate-800 rounded-xl border border-[#176B98]/20 dark:border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-[#176B98] dark:text-[#38bdf8]" />
              <span>My Employee Profile</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                signOut();
              }}
              className="w-full text-left py-2.5 px-4 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-xl border border-red-200 dark:border-red-900/60 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
      {/* Learner Personal Profile & Password Modal */}
      <LearnerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};
