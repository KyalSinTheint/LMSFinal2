import React, { useState, useEffect } from 'react';
import {
  PortalHeader,
  NavTabId,
  OurCompanySubpage,
  OUR_COMPANY_DROPDOWN_ITEMS,
  LdSubpage,
  LD_DROPDOWN_ITEMS,
} from './components/PortalHeader';
import { PortalFooter } from './components/PortalFooter';
import { OurCompanyHero } from './components/OurCompanyHero';
import { CeoMottoSection } from './components/CeoMottoSection';
import { AboutKBZLifeSection } from './components/AboutKBZLifeSection';
import { VisionMissionPurposeSection } from './components/VisionMissionPurposeSection';
import { CoreValuesSection } from './components/CoreValuesSection';
import { AspirationsSection } from './components/AspirationsSection';
import { HubPlaceholderView } from './components/HubPlaceholderView';
import { ContentEditorModal } from './components/ContentEditorModal';
import { OurCompanyNewsPage } from './components/OurCompanyNewsPage';
import { CompanyUpdateVideoPage } from './components/CompanyUpdateVideoPage';
import { TopPerformerPage } from './components/TopPerformerPage';
import {
  defaultCompanyContent,
  samplePreviewCompanyContent,
  CompanyContentData,
} from './data/companyContent';
import {
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Home,
  BookOpen,
  Layers,
  GraduationCap,
  AlertTriangle,
  Users,
} from 'lucide-react';

import { LmsProvider, useLms } from './context/LmsContext';
import { AdminLayout } from './components/admin/AdminLayout';
import { LicenseTrainingPage } from './components/learner/LicenseTrainingPage';
import { SkillDevelopmentPage } from './components/learner/SkillDevelopmentPage';
import { LdOverviewPage } from './components/learner/LdOverviewPage';
import { LearnerCoursesView } from './components/learner/LearnerCoursesView';
import { ProductKnowledgeHubPage } from './components/learner/ProductKnowledgeHubPage';
import { CompanyBulletinPage } from './components/learner/CompanyBulletinPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { PendingApprovalPage } from './components/auth/PendingApprovalPage';
import { AccountRestrictedPage } from './components/auth/AccountRestrictedPage';

function AppContent() {
  const { currentUser, isAuthenticated, signOut, refreshData } = useLms();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<NavTabId>('our-company');
  const [activeSubpage, setActiveSubpage] = useState<OurCompanySubpage>('overview');
  const [activeLdSubpage, setActiveLdSubpage] = useState<LdSubpage>('overview');
  const [isPlaceholderMode, setIsPlaceholderMode] = useState<boolean>(true);
  const [customContent, setCustomContent] = useState<CompanyContentData | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  // Sync with URL hash, strictly preventing regular users from accessing #admin
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#register') {
        setAuthView('register');
      } else if (window.location.hash === '#login') {
        setAuthView('login');
      } else if (window.location.hash === '#admin') {
        if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
          // Prevent URL manipulation: Regular users cannot access #admin
          window.location.hash = '';
        }
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser.role]);

  const handleToggleMode = () => {
    setIsPlaceholderMode(!isPlaceholderMode);
    setCustomContent(null);
  };

  const handleSelectTab = (tabId: NavTabId, subpage?: string) => {
    setActiveTab(tabId);
    if (tabId === 'our-company') {
      setActiveSubpage((subpage as OurCompanySubpage) || 'overview');
    } else if (tabId === 'learning-dev') {
      setActiveLdSubpage((subpage as LdSubpage) || 'overview');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCustomContent = (updated: CompanyContentData) => {
    setCustomContent(updated);
  };

  const handleResetContent = () => {
    setCustomContent(null);
    setIsPlaceholderMode(true);
  };

  // Active content based on mode or user edits
  const activeContent: CompanyContentData = customContent
    ? customContent
    : isPlaceholderMode
    ? defaultCompanyContent
    : samplePreviewCompanyContent;

  // 1. Unauthenticated visitors MUST NOT access protected Admin or User Panel
  if (!isAuthenticated) {
    if (authView === 'register' || window.location.hash === '#register') {
      return (
        <RegisterPage
          onNavigateToLogin={() => {
            setAuthView('login');
            window.location.hash = 'login';
          }}
          onRegistrationSuccess={() => {
            setAuthView('login');
          }}
        />
      );
    }
    return (
      <LoginPage
        onNavigateToRegister={() => {
          setAuthView('register');
          window.location.hash = 'register';
        }}
        onLoginSuccess={(role) => {
          if (role === 'admin' || role === 'super_admin') {
            window.location.hash = '#admin';
          } else {
            window.location.hash = '';
          }
        }}
      />
    );
  }

  // 2. Pending account approval gating: Do NOT show protected content while pending
  if (currentUser.account_status === 'pending') {
    return (
      <PendingApprovalPage
        onApprovalDetected={async () => {
          await refreshData();
        }}
        onLogout={signOut}
      />
    );
  }

  // 3. Rejected or suspended account gating
  if (currentUser.account_status === 'rejected' || currentUser.account_status === 'suspended') {
    return (
      <AccountRestrictedPage
        onLogout={signOut}
        onNavigateToLogin={signOut}
      />
    );
  }

  // 4. Administrator role (Super Admin & Admin) → Admin Console ONLY (Strictly separated; no switch to User Panel)
  if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
    return <AdminLayout />;
  }

  // 5. Approved regular user → User Panel ONLY (Strictly separated; no switch to Admin Panel)
  return (
    <div className="min-h-screen bg-[#F3F8FB] dark:bg-[#0B131E] bg-light-blue-pattern text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-[#176B98] selection:text-white max-w-full overflow-x-hidden transition-colors">
      {/* Shared Header & Responsive Navigation (Regular User) */}
      <PortalHeader
        activeTab={activeTab}
        activeSubpage={activeSubpage}
        activeLdSubpage={activeLdSubpage}
        onSelectTab={handleSelectTab}
        isPlaceholderMode={isPlaceholderMode && !customContent}
        onTogglePlaceholderMode={handleToggleMode}
        onOpenContentEditor={() => setIsEditorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full" id="main-content">

        {/* Secondary Sub-Navigation Toolbar when inside Our Company */}
        {activeTab === 'our-company' && (
          <div className="bg-[#F3F8FB]/95 dark:bg-[#0E2035]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E426D] sticky top-18 z-30 shadow-2xs transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
              {/* Breadcrumb Indicator */}
              <div className="flex items-center gap-2 text-xs text-[#737373] dark:text-slate-400 font-medium">
                <button
                  onClick={() => handleSelectTab('our-company', 'overview')}
                  className="hover:text-[#176B98] dark:hover:text-[#38bdf8] flex items-center gap-1 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Our Company</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                <span className="font-bold text-[#176B98] dark:text-[#38bdf8]">
                  {OUR_COMPANY_DROPDOWN_ITEMS.find((item) => item.id === activeSubpage)?.label}
                </span>
              </div>

              {/* Subpage Tabs Switcher */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {OUR_COMPANY_DROPDOWN_ITEMS.map((item) => {
                  const isCurrent = activeSubpage === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab('our-company', item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-[#176B98] text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8] hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Secondary Sub-Navigation Toolbar when inside Learning and Development Hub */}
        {activeTab === 'learning-dev' && (
          <div className="bg-[#F3F8FB]/95 dark:bg-[#0E2035]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1E426D] sticky top-18 z-30 shadow-2xs transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
              {/* Breadcrumb Indicator */}
              <div className="flex items-center gap-2 text-xs text-[#737373] dark:text-slate-400 font-medium">
                <button
                  onClick={() => handleSelectTab('learning-dev', 'overview')}
                  className="hover:text-[#176B98] dark:hover:text-[#38BDF8] flex items-center gap-1 cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#176B98] dark:text-[#38BDF8]" />
                  <span>Learning and Development Hub</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                <span className="font-bold text-[#176B98] dark:text-[#38BDF8]">
                  {LD_DROPDOWN_ITEMS.find((item) => item.id === activeLdSubpage)?.label}
                </span>
              </div>

              {/* Subpage Tabs Switcher matching Our Company */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                {LD_DROPDOWN_ITEMS.map((item) => {
                  const isCurrent = activeLdSubpage === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab('learning-dev', item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-[#176B98] text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38BDF8] hover:bg-slate-100 dark:hover:bg-[#153252]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CONTENT ROUTING */}
        {activeTab === 'our-company' ? (
          <div>
            {/* SUBPAGE 1: OVERVIEW (Full Page 1 Implementation) */}
            {activeSubpage === 'overview' && (
              <div>
                <OurCompanyHero content={activeContent.hero} />
                <CeoMottoSection content={activeContent.ceoMotto} />
                <AboutKBZLifeSection content={activeContent.about} />
                <VisionMissionPurposeSection
                  vision={activeContent.vision}
                  mission={activeContent.mission}
                  purpose={activeContent.purpose}
                />
                <CoreValuesSection content={activeContent.coreValues} />
                <AspirationsSection content={activeContent.aspirations} />
              </div>
            )}

            {/* SUBPAGE 2: OUR COMPANY NEWS */}
            {activeSubpage === 'news' && (
              <OurCompanyNewsPage onBackToOverview={() => setActiveSubpage('overview')} />
            )}

            {/* SUBPAGE 3: COMPANY UPDATE VIDEO */}
            {activeSubpage === 'videos' && (
              <CompanyUpdateVideoPage onBackToOverview={() => setActiveSubpage('overview')} />
            )}

            {/* SUBPAGE 4: TOP PERFORMER */}
            {activeSubpage === 'top-performers' && (
              <TopPerformerPage onBackToOverview={() => setActiveSubpage('overview')} />
            )}
          </div>
        ) : activeTab === 'learning-dev' ? (
          /* LEARNING AND DEVELOPMENT HUB ROUTING */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeLdSubpage === 'overview' ? (
              <LdOverviewPage
                onNavigateToLicenseTraining={() => handleSelectTab('learning-dev', 'license-training')}
                onNavigateToSkillDev={() => handleSelectTab('learning-dev', 'skill-development')}
              />
            ) : activeLdSubpage === 'license-training' ? (
              <LicenseTrainingPage />
            ) : (
              <SkillDevelopmentPage />
            )}
          </div>
        ) : activeTab === 'product-knowledge' ? (
          /* TAB 3: PRODUCT KNOWLEDGE HUB */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProductKnowledgeHubPage />
          </div>
        ) : (
          /* TAB 4: COMPANY BULLETIN */
          <CompanyBulletinPage />
        )}
      </main>

      {/* Shared Footer with Quick Links */}
      <PortalFooter
        activeTab={activeTab}
        onSelectTab={(tabId) => handleSelectTab(tabId, 'overview')}
      />

      {/* Content Editor Modal for Stakeholder Content Population */}
      <ContentEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        currentContent={activeContent}
        onSaveContent={handleSaveCustomContent}
        onResetContent={handleResetContent}
      />
    </div>
  );
}

export default function App() {
  return (
    <LmsProvider>
      <AppContent />
    </LmsProvider>
  );
}
