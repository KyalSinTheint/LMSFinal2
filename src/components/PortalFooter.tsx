import React from 'react';
import { Shield, ExternalLink, ArrowUp, Mail, Phone, MapPin, Globe, Share2 } from 'lucide-react';
import { NavTabId, NAV_ITEMS } from './PortalHeader';

interface PortalFooterProps {
  onSelectTab: (tabId: NavTabId) => void;
  activeTab: NavTabId;
}

export const PortalFooter: React.FC<PortalFooterProps> = ({ onSelectTab, activeTab }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#176B98] dark:bg-[#0E2035] text-white border-t border-[#135A80] dark:border-[#1E426D] mt-20" role="contentinfo">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Column 1: Brand & Overview (4 cols) */}
          <div className="md:col-span-4 space-y-5 text-left">
            <div className="flex items-center gap-3">
              <div data-keep-light="true" className="bg-white rounded-xl p-2 shadow-xs shrink-0 flex items-center justify-center">
                <img
                  src="/assets/aistudio/KBZ_Logo_28e9d8fb.png"
                  alt="KBZ LIFE Insurance"
                  className="h-9 sm:h-10 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col border-l border-white/20 pl-3">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-tight">
                  KBZ LIFE Insurance
                </span>
                <span className="text-[10px] sm:text-[11px] text-white/80 tracking-wider uppercase font-semibold mt-0.5">
                  Employee Learning Portal
                </span>
              </div>
            </div>

            <div className="pt-1">
              <span className="inline-block px-3 py-1 rounded-md bg-white/10 text-xs font-mono text-white/90 border border-white/15">
                The Right Insurance For You
              </span>
            </div>

            {/* Official Social Media Links */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-2.5 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                <span>Connect With Us</span>
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@KBZLIFE"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visit KBZLIFE on YouTube"
                  aria-label="Visit KBZLIFE on YouTube (opens in a new tab)"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 dark:bg-[#153252] text-white/90 dark:text-slate-200 border border-white/15 dark:border-[#1E426D] hover:bg-white/20 dark:hover:bg-[#1E426D] hover:text-white dark:hover:text-white hover:border-white/30 text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/40 dark:focus:ring-[#38BDF8]/50 cursor-pointer shadow-2xs group"
                >
                  <svg className="w-4 h-4 text-white/90 dark:text-slate-200 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span>YouTube</span>
                </a>

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/kbzlife/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visit KBZLIFE on Facebook"
                  aria-label="Visit KBZLIFE on Facebook (opens in a new tab)"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 dark:bg-[#153252] text-white/90 dark:text-slate-200 border border-white/15 dark:border-[#1E426D] hover:bg-white/20 dark:hover:bg-[#1E426D] hover:text-white dark:hover:text-white hover:border-white/30 text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/40 dark:focus:ring-[#38BDF8]/50 cursor-pointer shadow-2xs group"
                >
                  <svg className="w-4 h-4 text-white/90 dark:text-slate-200 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/kbz-life-insurance-co-ltd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visit KBZLIFE on LinkedIn"
                  aria-label="Visit KBZLIFE on LinkedIn (opens in a new tab)"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 dark:bg-[#153252] text-white/90 dark:text-slate-200 border border-white/15 dark:border-[#1E426D] hover:bg-white/20 dark:hover:bg-[#1E426D] hover:text-white dark:hover:text-white hover:border-white/30 text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/40 dark:focus:ring-[#38BDF8]/50 cursor-pointer shadow-2xs group"
                >
                  <svg className="w-4 h-4 text-white/90 dark:text-slate-200 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>

                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@kbz.life.insurance"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Visit KBZLIFE on TikTok"
                  aria-label="Visit KBZLIFE on TikTok (opens in a new tab)"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 dark:bg-[#153252] text-white/90 dark:text-slate-200 border border-white/15 dark:border-[#1E426D] hover:bg-white/20 dark:hover:bg-[#1E426D] hover:text-white dark:hover:text-white hover:border-white/30 text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/40 dark:focus:ring-[#38BDF8]/50 cursor-pointer shadow-2xs group"
                >
                  <svg className="w-4 h-4 text-white/90 dark:text-slate-200 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.34 0 .66.06.96.16V9.06a6.34 6.34 0 0 0-.96-.08 6.34 6.34 0 0 0-6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 0 0 0 6.34-6.34V8.41a8.3 8.3 0 0 0 3.76.91V6.69z" />
                  </svg>
                  <span>TikTok</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (Mandated strictly in footer only) (3 cols) */}
          <div className="md:col-span-3 space-y-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/90 pb-1 border-b border-white/15">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm" aria-label="Portal Quick Links">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onSelectTab(item.id);
                        scrollToTop();
                      }}
                      className={`group flex items-center gap-2 transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'text-white font-bold underline underline-offset-4 decoration-white'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white opacity-60 group-hover:opacity-100 transition-opacity" />
                      <span>{item.label}</span>
                      {!item.isReady && (
                        <span className="text-[10px] bg-white/15 text-white/80 px-1.5 py-0.2 rounded font-normal">
                          Coming soon
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="pt-4">
              <a
                href="https://kbzlife.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-white/90 hover:text-white transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Website : kbzlife.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Column 3: Contact Information (5 cols) */}
          <div className="md:col-span-5 space-y-4 text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/90 pb-1 border-b border-white/15">
              Contact Information
            </h3>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 bg-white/10 p-3 rounded-lg border border-white/15">
                <Mail className="w-4 h-4 text-white/90 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Email</span>
                  <a href="mailto:info@kbzlife.com" className="text-white/80 hover:text-white">
                    info@kbzlife.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white/10 p-3 rounded-lg border border-white/15">
                <Phone className="w-4 h-4 text-white/90 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Call Us</span>
                  <a href="tel:+959954477788" className="text-white/80 hover:text-white">
                    (+95) 9954477788
                  </a>
                </div>
              </div>
            </div>

            {/* Branch Addresses */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white/90 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Yangon Head Office:</span>
                  <p className="text-white/80 leading-relaxed mt-0.5">
                    No.C520/A-5, Pyae Wa Condominium, Kabar Aye Pagoda Road, Bahan Township, Yangon.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white/90 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Mandalay Branch:</span>
                  <p className="text-white/80 leading-relaxed mt-0.5">
                    No.A(5+6), 33 Street , Between (77*78) Street, Chanayethazan Township, Mandalay.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-white/90 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Taunggyi Branch:</span>
                  <p className="text-white/80 leading-relaxed mt-0.5">
                    Room A - 10, Shop House Unit A, Small Highway Station, Taunggyi-Hopong Road, Taunggyi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Standards */}
        <div className="mt-14 pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <div>
            © {new Date().getFullYear()} KBZ LIFE Insurance. All rights reserved. The Right Insurance For You.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
