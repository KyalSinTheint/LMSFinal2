import React, { useState, useRef } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Minus,
  Eye,
  Edit3,
  Columns,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { ProductRichTextRenderer } from '../common/ProductRichTextRenderer';

interface ProductKnowledgeRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const ProductKnowledgeRichEditor: React.FC<ProductKnowledgeRichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write complete product knowledge, coverage guidelines, customer benefits, eligibility rules, and underwriting terms here...',
  minHeight = '320px',
}) => {
  const [viewMode, setViewMode] = useState<'write' | 'preview' | 'split'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to insert markdown tokens at cursor or around selected text
  const insertFormatting = (before: string, after: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const selectedText = currentVal.substring(start, end) || defaultPlaceholder;
    const replacement = `${before}${selectedText}${after}`;

    const nextVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    onChange(nextVal);

    // Reposition cursor after update
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handleHeading = (level: 1 | 2 | 3) => {
    const prefix = level === 1 ? '# ' : level === 2 ? '## ' : '### ';
    insertFormatting(`\n${prefix}`, '\n', `Heading Level ${level}`);
  };

  const handleBold = () => {
    insertFormatting('**', '**', 'bold text');
  };

  const handleItalic = () => {
    insertFormatting('*', '*', 'italic text');
  };

  const handleBulletList = () => {
    insertFormatting('\n- ', '\n- \n', 'Key benefit or protection point');
  };

  const handleNumberedList = () => {
    insertFormatting('\n1. ', '\n2. \n', 'Step or condition 1');
  };

  const handleQuote = () => {
    insertFormatting('\n> ', '\n', 'Important policy caveat or underwriting notice');
  };

  const handleDivider = () => {
    insertFormatting('\n\n---\n\n', '', '');
  };

  const handleInsertTemplate = () => {
    const template = `## Product Overview & Purpose
Comprehensive explanation of what this insurance plan covers, how it operates, and why it benefits policyholders.

## Key Benefits & Policyholder Protections
- Guaranteed Sum Assured payout upon maturity or demise
- 24/7 worldwide coverage for accidental trauma and bodily injuries
- Flexible reversionary bonuses added annually
- Premium freeze and guaranteed renewability

## Policy Terms & Features
1. Flexible Policy Durations: 5, 10, 15, or 20 years
2. Entry Age: 18 to 60 years old (Myanmar citizens)
3. Grace Period: 30 days for premium renewal

## Underwriting & Eligibility Criteria
- Standard health declaration required
- Minimum Sum Assured: 5,000,000 MMK
- Premium payment channels: KBZPay, KBZ Bank transfer, or authorized agents

## Claims & Settlement Procedure
In the event of a covered claim, contact KBZLife customer care within 14 days with official medical certificates and identity documentation.`;

    if (value && value.trim()) {
      if (window.confirm('Append standard KBZLife Product Knowledge outline to current text?')) {
        onChange(value + '\n\n' + template);
      }
    } else {
      onChange(template);
    }
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs focus-within:ring-2 focus-within:ring-[#176B98]/20 focus-within:border-[#176B98] transition-all">
      {/* Top Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left Formatting Action Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => handleHeading(1)}
              className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded-md text-xs font-black transition-colors cursor-pointer"
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => handleHeading(2)}
              className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded-md text-xs font-black transition-colors cursor-pointer"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => handleHeading(3)}
              className="px-2 py-1 text-slate-700 hover:bg-slate-100 rounded-md text-xs font-black transition-colors cursor-pointer"
              title="Heading 3"
            >
              H3
            </button>
          </div>

          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleBold}
              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Bold (**text**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleItalic}
              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Italic (*text*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={handleBulletList}
              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Bullet List (- item)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNumberedList}
              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Numbered List (1. item)"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleQuote}
              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Callout Quote (> quote)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDivider}
              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Divider (---)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleInsertTemplate}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-sky-50 hover:bg-sky-100 text-[#176B98] font-bold border border-sky-200 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Insert standard product outline template"
          >
            <Sparkles className="w-3 h-3 text-[#176B98]" />
            <span>Insert Standard Sections</span>
          </button>
        </div>

        {/* Right View Mode Selector */}
        <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('write')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              viewMode === 'write'
                ? 'bg-[#176B98] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Write</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-[#176B98] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`hidden md:flex px-2.5 py-1 rounded-md text-[11px] font-bold items-center gap-1 transition-colors cursor-pointer ${
              viewMode === 'split'
                ? 'bg-[#176B98] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>Split</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative">
        {viewMode === 'write' && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight }}
            className="w-full p-4 text-xs sm:text-sm text-slate-800 font-normal leading-relaxed focus:outline-none resize-y"
          />
        )}

        {viewMode === 'preview' && (
          <div
            style={{ minHeight }}
            className="w-full p-5 overflow-y-auto bg-slate-50/40 text-xs sm:text-sm"
          >
            {value.trim() ? (
              <ProductRichTextRenderer content={value} />
            ) : (
              <div className="text-center py-12 text-slate-400 italic">
                No content entered yet. Switch to Write tab or click &ldquo;Insert Standard Sections&rdquo; to begin.
              </div>
            )}
          </div>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-2 divide-x divide-slate-200" style={{ minHeight }}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              style={{ minHeight }}
              className="w-full p-4 text-xs sm:text-sm text-slate-800 font-normal leading-relaxed focus:outline-none resize-none"
            />
            <div
              style={{ minHeight }}
              className="w-full p-4 overflow-y-auto bg-slate-50/40 text-xs sm:text-sm"
            >
              {value.trim() ? (
                <ProductRichTextRenderer content={value} />
              ) : (
                <div className="text-center py-12 text-slate-400 italic">
                  Live preview will render here as you write...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer / Info Bar */}
      <div className="bg-slate-50/80 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Supports # headings, **bold**, *italic*, - bullets, 1. lists</span>
        </div>
      </div>
    </div>
  );
};
