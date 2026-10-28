import React, { useState } from 'react';
import { X, Check, Copy, RefreshCw, Sparkles, FileText, Download } from 'lucide-react';
import { CompanyContentData } from '../data/companyContent';
import { useBodyScrollLock } from '../lib/useBodyScrollLock';

interface ContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent: CompanyContentData;
  onSaveContent: (updated: CompanyContentData) => void;
  onResetContent: () => void;
}

export const ContentEditorModal: React.FC<ContentEditorModalProps> = ({
  isOpen,
  onClose,
  currentContent,
  onSaveContent,
  onResetContent,
}) => {
  useBodyScrollLock(isOpen);
  const [formData, setFormData] = useState<CompanyContentData>(currentContent);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'ceo' | 'vision' | 'values' | 'aspirations'>('hero');

  if (!isOpen) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSaveContent(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#10243C] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-[#1E426D]">
        {/* Modal Header */}
        <div className="p-6 bg-[#003366] dark:bg-[#0E2035] text-white flex items-center justify-between border-b border-transparent dark:border-[#1E426D]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Content & Asset Configuration</h2>
              <p className="text-xs text-sky-200">
                Update official KBZLife copy and asset URLs without editing UI code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="bg-slate-100 dark:bg-[#0E1F33] border-b border-slate-200 dark:border-[#1E426D] px-6 flex gap-2 overflow-x-auto py-2">
          {[
            { id: 'hero', label: 'Hero & Intro' },
            { id: 'ceo', label: 'CEO Motto' },
            { id: 'vision', label: 'Vision/Mission/Purpose' },
            { id: 'values', label: 'Core Values' },
            { id: 'aspirations', label: 'ရည်မှန်းထားသောအရာ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#153252] text-[#003366] dark:text-[#38BDF8] shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Hero Eyebrow
                </label>
                <input
                  type="text"
                  value={formData.hero.eyebrow}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, eyebrow: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-[#00529B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Hero Main Heading
                </label>
                <input
                  type="text"
                  value={formData.hero.heading}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, heading: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-[#00529B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subheading / Welcome Text
                </label>
                <textarea
                  rows={3}
                  value={formData.hero.subheading}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, subheading: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-[#00529B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Hero Image URL (or leave empty to show placeholder frame)
                </label>
                <input
                  type="text"
                  placeholder="https://... or /assets/..."
                  value={formData.hero.imageUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: {
                        ...formData.hero,
                        imageUrl: e.target.value ? e.target.value : null,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-[#00529B]"
                />
              </div>
            </div>
          )}

          {activeTab === 'ceo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  CEO Official Motto / Quotation
                </label>
                <textarea
                  rows={3}
                  value={formData.ceoMotto.motto}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ceoMotto: { ...formData.ceoMotto, motto: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-[#00529B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    CEO Name
                  </label>
                  <input
                    type="text"
                    value={formData.ceoMotto.ceoName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ceoMotto: { ...formData.ceoMotto, ceoName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-[#00529B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    CEO Official Title
                  </label>
                  <input
                    type="text"
                    value={formData.ceoMotto.ceoTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ceoMotto: { ...formData.ceoMotto, ceoTitle: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-[#00529B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  CEO Photo URL (or leave empty for placeholder)
                </label>
                <input
                  type="text"
                  placeholder="https://... or /assets/..."
                  value={formData.ceoMotto.photoUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ceoMotto: {
                        ...formData.ceoMotto,
                        photoUrl: e.target.value ? e.target.value : null,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-[#00529B]"
                />
              </div>
            </div>
          )}

          {activeTab === 'vision' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Our Vision (Burmese)
                </label>
                <textarea
                  rows={2}
                  value={formData.vision.burmeseStatement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vision: { ...formData.vision, burmeseStatement: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-myanmar border border-slate-200 rounded-lg focus:outline-[#00529B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Our Vision (English)
                </label>
                <input
                  type="text"
                  value={formData.vision.englishStatement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vision: { ...formData.vision, englishStatement: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-[#00529B]"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Our Mission (Burmese)
                </label>
                <textarea
                  rows={2}
                  value={formData.mission.burmeseStatement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mission: { ...formData.mission, burmeseStatement: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-myanmar border border-slate-200 rounded-lg focus:outline-[#00529B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Our Mission (English)
                </label>
                <input
                  type="text"
                  value={formData.mission.englishStatement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mission: { ...formData.mission, englishStatement: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-[#00529B]"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Our Purpose (Burmese)
                </label>
                <textarea
                  rows={2}
                  value={formData.purpose.burmeseStatement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purpose: { ...formData.purpose, burmeseStatement: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-myanmar border border-slate-200 rounded-lg focus:outline-[#00529B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Our Purpose (English)
                </label>
                <input
                  type="text"
                  value={formData.purpose.englishStatement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purpose: { ...formData.purpose, englishStatement: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-[#00529B]"
                />
              </div>
            </div>
          )}

          {activeTab === 'values' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Official Core Values with Burmese titles and descriptions.
              </p>
              {formData.coreValues.items.map((val, idx) => (
                <div key={val.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Value 0{idx + 1}</span>
                    <span className="text-[11px] font-mono text-slate-400">{val.iconName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={val.title}
                      placeholder="English Title"
                      onChange={(e) => {
                        const newItems = [...formData.coreValues.items];
                        newItems[idx].title = e.target.value;
                        setFormData({
                          ...formData,
                          coreValues: { ...formData.coreValues, items: newItems },
                        });
                      }}
                      className="w-full px-2 py-1 text-sm font-semibold border border-slate-200 rounded bg-white"
                    />
                    <input
                      type="text"
                      value={val.burmeseSubtitle}
                      placeholder="Burmese Subtitle"
                      onChange={(e) => {
                        const newItems = [...formData.coreValues.items];
                        newItems[idx].burmeseSubtitle = e.target.value;
                        setFormData({
                          ...formData,
                          coreValues: { ...formData.coreValues, items: newItems },
                        });
                      }}
                      className="w-full px-2 py-1 text-sm font-myanmar font-semibold border border-slate-200 rounded bg-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={val.description}
                    onChange={(e) => {
                      const newItems = [...formData.coreValues.items];
                      newItems[idx].description = e.target.value;
                      setFormData({
                        ...formData,
                        coreValues: { ...formData.coreValues, items: newItems },
                      });
                    }}
                    className="w-full px-2 py-1 text-xs font-myanmar border border-slate-200 rounded bg-white"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'aspirations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Burmese Heading
                  </label>
                  <input
                    type="text"
                    value={formData.aspirations.burmeseHeading}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        aspirations: { ...formData.aspirations, burmeseHeading: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm font-myanmar border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    English Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.aspirations.englishSubtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        aspirations: { ...formData.aspirations, englishSubtitle: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {formData.aspirations.items.map((asp, idx) => (
                <div key={asp.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="text-xs font-bold text-slate-700">Commitment 0{idx + 1}</div>
                  <textarea
                    rows={2}
                    value={asp.paragraph}
                    onChange={(e) => {
                      const newItems = [...formData.aspirations.items];
                      newItems[idx].paragraph = e.target.value;
                      setFormData({
                        ...formData,
                        aspirations: { ...formData.aspirations, items: newItems },
                      });
                    }}
                    className="w-full px-2 py-1 text-xs font-myanmar border border-slate-200 rounded bg-white"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON!' : 'Copy Config JSON'}</span>
            </button>

            <button
              onClick={onResetContent}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Placeholders</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#003366] hover:bg-[#00529B] rounded-lg transition-colors shadow-2xs"
            >
              Apply Updates to Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
