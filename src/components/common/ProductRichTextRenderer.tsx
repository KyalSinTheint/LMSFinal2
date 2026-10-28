import React from 'react';

interface ProductRichTextRendererProps {
  content: string;
  className?: string;
}

export const ProductRichTextRenderer: React.FC<ProductRichTextRendererProps> = ({
  content,
  className = '',
}) => {
  if (!content || !content.trim()) {
    return null;
  }

  // Helper to parse inline formatting (**bold**, *italic*, `code`)
  const renderInlineFormatted = (text: string): React.ReactNode => {
    // Split by bold (**text**)
    const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={idx} className="font-extrabold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Check for code (`code`)
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((cPart, cIdx) => {
        if (cPart.startsWith('`') && cPart.endsWith('`') && cPart.length >= 2) {
          return (
            <code
              key={`${idx}-${cIdx}`}
              className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#176B98] dark:text-[#38bdf8] font-mono text-xs"
            >
              {cPart.slice(1, -1)}
            </code>
          );
        }

        // Check for italic (*text* or _text_)
        const italicParts = cPart.split(/(\*[^*]+\*|_[^_]+_)/g);
        return italicParts.map((iPart, iIdx) => {
          if (
            ((iPart.startsWith('*') && iPart.endsWith('*')) ||
              (iPart.startsWith('_') && iPart.endsWith('_'))) &&
            iPart.length >= 2
          ) {
            return (
              <em key={`${idx}-${cIdx}-${iIdx}`} className="italic text-slate-800 dark:text-slate-200">
                {iPart.slice(1, -1)}
              </em>
            );
          }
          return iPart;
        });
      });
    });
  };

  // Parse lines into blocks
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentParagraphLines: string[] = [];
  let blockKey = 0;

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join('\n').trim();
      if (text) {
        blocks.push(
          <p
            key={`p-${blockKey++}`}
            className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal my-3 whitespace-pre-line break-words"
          >
            {renderInlineFormatted(text)}
          </p>
        );
      }
      currentParagraphLines = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        blocks.push(
          <ul key={`ul-${blockKey++}`} className="space-y-2.5 my-4 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                <span className="w-2 h-2 rounded-full bg-[#176B98] dark:bg-[#38bdf8] mt-2 shrink-0 ring-4 ring-sky-100 dark:ring-sky-950/60" />
                <span className="flex-1 whitespace-pre-line break-words">{renderInlineFormatted(item)}</span>
              </li>
            ))}
          </ul>
        );
      } else {
        blocks.push(
          <ol key={`ol-${blockKey++}`} className="space-y-2.5 my-4 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                <span className="w-5 h-5 rounded-lg bg-[#176B98]/10 dark:bg-[#176B98]/30 text-[#176B98] dark:text-[#38bdf8] text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 border border-[#176B98]/20 dark:border-[#38bdf8]/30">
                  {idx + 1}
                </span>
                <span className="flex-1 whitespace-pre-line break-words">{renderInlineFormatted(item)}</span>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty line separates paragraphs and ends lists
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushParagraph();
      flushList();
      blocks.push(
        <hr key={`hr-${blockKey++}`} className="my-6 border-slate-200 dark:border-slate-800" />
      );
      continue;
    }

    // Headings
    if (trimmed.startsWith('#')) {
      flushParagraph();
      flushList();

      if (trimmed.startsWith('### ')) {
        blocks.push(
          <h3
            key={`h3-${blockKey++}`}
            className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-5 mb-2 tracking-tight flex items-center gap-2"
          >
            <span className="w-1.5 h-4 rounded-full bg-[#176B98] dark:bg-[#38bdf8]" />
            <span>{renderInlineFormatted(trimmed.slice(4))}</span>
          </h3>
        );
      } else if (trimmed.startsWith('## ')) {
        blocks.push(
          <h2
            key={`h2-${blockKey++}`}
            className="text-base sm:text-lg font-black text-[#176B98] dark:text-[#38bdf8] mt-6 mb-3 tracking-tight border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2"
          >
            <span>{renderInlineFormatted(trimmed.slice(3))}</span>
          </h2>
        );
      } else if (trimmed.startsWith('# ')) {
        blocks.push(
          <h1
            key={`h1-${blockKey++}`}
            className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-6 mb-3 tracking-tight border-b-2 border-[#176B98]/20 dark:border-[#38bdf8]/30 pb-2.5"
          >
            {renderInlineFormatted(trimmed.slice(2))}
          </h1>
        );
      }
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      flushParagraph();
      flushList();
      const quoteText = trimmed.replace(/^>\s?/, '');
      blocks.push(
        <blockquote
          key={`quote-${blockKey++}`}
          className="p-4 my-3 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border-l-4 border-[#176B98] dark:border-[#38bdf8] text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium italic shadow-2xs"
        >
          {renderInlineFormatted(quoteText)}
        </blockquote>
      );
      continue;
    }

    // Bullet List Item (- or * or • or ✦ or ▪ or –)
    const bulletMatch = trimmed.match(/^[-*•✦▪–]\s*(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Numbered List Item (1. or 1))
    const numberMatch = trimmed.match(/^\d+[.)]\s*(.+)$/);
    if (numberMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numberMatch[1]);
      continue;
    }

    // Normal text line - buffer into paragraph
    flushList();
    currentParagraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return <div className={`product-rich-text space-y-1 ${className}`}>{blocks}</div>;
};
