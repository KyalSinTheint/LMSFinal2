import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Database,
  ShieldAlert,
  ChevronRight,
  LogOut,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';
import { AccessManagement } from './AccessManagement';
import { AuditLogsView } from './AuditLogsView';
import { CompanyNewsManagement } from './CompanyNewsManagement';
import { CompanyVideosManagement } from './CompanyVideosManagement';
import { TopPerformersManagement } from './TopPerformersManagement';
import { TeamManagement } from './TeamManagement';
import { AdminSettingsView } from './AdminSettingsView';
import { SupabaseSetupModal } from './SupabaseSetupModal';
import { AdminProfileModal } from './AdminProfileModal';
import { LicenseTrainingManagement } from './LicenseTrainingManagement';
import { SkillDevelopmentManagement } from './SkillDevelopmentManagement';
import { ProductManagement } from './ProductManagement';
import { CompanyBulletinManagement } from './CompanyBulletinManagement';
import { Newspaper, Film, Award, Key, User, Lock, Settings as SettingsIcon, Package, Bell, Sun, Moon } from 'lucide-react';
import { AdminLoginModal } from './AdminLoginModal';

export type AdminTabId =
  | 'dashboard'
  | 'users'
  | 'access'
  | 'bulletin'
  | 'products'
  | 'license-training'
  | 'skill-development'
  | 'news'
  | 'videos'
  | 'performers'
  | 'team'
  | 'audit-logs'
  | 'settings';

interface AdminLayoutProps {
  onReturnToUserPortal?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const { currentUser, isSupabaseLive, refreshData, isLoading, signOut, theme, toggleTheme } = useLms();
  const [activeTab, setActiveTab] = useState<AdminTabId>('dashboard');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Security Check: If current user is neither admin nor super_admin, show Access Denied
  if (currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-[#F3F8FB] bg-light-blue-pattern flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-red-200 shadow-xl max-w-lg w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800">
              403 Forbidden · Role-Based Access Control
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Administrator Privileges Required
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              You are currently authenticated as{' '}
              <strong className="text-slate-900">{currentUser.full_name}</strong> ({currentUser.email}), with standard{' '}
              <span className="font-bold uppercase text-purple-700">USER</span> privileges. Only authorized KBZLife LMS administrators may access this console.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
            <p className="font-bold text-slate-800">Security Rule Enforcement:</p>
            <p>• Client-side role spoofing is strictly prohibited.</p>
            <p>• Supabase PostgreSQL RLS policies block unauthorized queries.</p>
            <p>• Please sign in with an authorized administrator account.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#12567a] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Login (Credentials)</span>
            </button>
            <button
              onClick={signOut}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer border border-red-200 flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <AdminLoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onSuccess={() => setIsLoginModalOpen(false)}
          />
        </div>
      </div>
    );
  }

  const ADMIN_TABS: { id: AdminTabId; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management & Approvals', icon: Users },
    { id: 'access', label: 'User Permissions & Access', icon: ShieldCheck },
    { id: 'bulletin', label: 'Company Bulletin', icon: Bell },
    { id: 'products', label: 'Product Knowledge Hub', icon: Package },
    { id: 'license-training', label: 'License Training', icon: Award },
    { id: 'skill-development', label: 'Skill Development', icon: Sparkles },
    { id: 'news', label: 'Company News', icon: Newspaper },
    { id: 'videos', label: 'Company Update Videos', icon: Film },
    { id: 'performers', label: 'Top Performers', icon: Award },
    { id: 'team', label: 'L&D Team & HOD Motto', icon: Users },
    { id: 'audit-logs', label: 'Audit Trail', icon: Clock },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#F3F8FB] dark:bg-[#0B131E] bg-light-blue-pattern text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased max-w-full overflow-x-hidden selection:bg-[#176B98] selection:text-white transition-colors">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-[#176B98] dark:bg-[#0E2035] text-white shadow-xs border-b border-[#135A80] dark:border-[#1E426D] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Left Brand Area */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 bg-white rounded-xl p-1 shadow-xs flex items-center justify-center shrink-0">
                  <img
                    src="/assets/aistudio/KBZ_Logo_28e9d8fb.png"
                    alt="KBZ LIFE"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold tracking-tight text-sm">KBZ LIFE Insurance</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-500 text-white tracking-wider">
                      ADMIN CONSOLE
                    </span>
                  </div>
                  <p className="text-[10px] text-white/80 hidden md:block">
                    Supabase PostgreSQL Connected · Row Level Security Active
                  </p>
                </div>
              </div>
            </div>

            {/* Right Tools & User Dropdown */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-300" />
                ) : (
                  <Moon className="w-4 h-4 text-sky-200" />
                )}
              </button>

              {/* Database status button */}
              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  isSupabaseLive
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                    : 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isSupabaseLive ? 'Supabase Live' : 'Supabase Config'}
                </span>
              </button>

              {/* Refresh data */}
              <button
                onClick={refreshData}
                disabled={isLoading}
                title="Refresh database data from Supabase"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {/* User Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <img
                    src={
                      currentUser.avatar_url ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
                    }
                    alt={currentUser.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-white/30"
                  />
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-bold leading-tight">{currentUser.full_name}</p>
                    <p className="text-[10px] text-white/80">
                      {currentUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#10243C] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#1E426D] py-2 z-50 text-slate-800 dark:text-slate-100 text-xs">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-[#1E426D] flex items-center gap-3">
                      <img
                        src={
                          currentUser.avatar_url ||
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
                        }
                        alt={currentUser.full_name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser.full_name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          currentUser.role === 'super_admin'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300'
                            : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                        }`}>
                          {currentUser.role === 'super_admin' ? 'Super Administrator' : 'Authorized Admin'}
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
                        <span>Administrator Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer flex items-center gap-2"
                      >
                        <Key className="w-4 h-4 text-amber-500" />
                        <span>Change Password</span>
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
          </div>
        </div>
      </header>

      {/* Mandatory First-Login Temporary Password Change Notice */}
      {currentUser.must_change_password && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 font-sans border-b border-amber-600 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase tracking-wide bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[10px]">
                Action Required
              </span>
              <span className="font-medium text-slate-950">
                You are currently signed in with the default temporary administrator password (<code>admin123</code>). Please establish your permanent credentials.
              </span>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-slate-950 text-white font-bold hover:bg-slate-800 transition-colors text-[11px] shrink-0 cursor-pointer shadow-xs"
            >
              Update Password Now
            </button>
          </div>
        </div>
      )}

      {/* Admin Sub-navigation Tabs Bar */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs sticky top-16 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#176B98] text-white shadow-xs'
                      : tab.id === 'license-training'
                      ? 'text-slate-600 dark:text-slate-300 hover:text-white hover:bg-[#176B98] dark:hover:bg-[#176B98]'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#176B98] dark:hover:text-[#38bdf8] hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTab={(tab) => {
              setActiveTab(tab);
            }}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        )}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'access' && <AccessManagement />}
        {activeTab === 'bulletin' && <CompanyBulletinManagement />}
        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'license-training' && <LicenseTrainingManagement />}
        {activeTab === 'skill-development' && <SkillDevelopmentManagement />}
        {activeTab === 'news' && <CompanyNewsManagement />}
        {activeTab === 'videos' && <CompanyVideosManagement />}
        {activeTab === 'performers' && <TopPerformersManagement />}
        {activeTab === 'team' && <TeamManagement />}
        {activeTab === 'audit-logs' && <AuditLogsView />}
        {activeTab === 'settings' && <AdminSettingsView />}
      </main>

      {/* Admin Profile & Password Modal */}
      <AdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Supabase & SQL Configuration Modal */}
      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};
