import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Safely parses text containing inline ($...$) or block ($$...$$) LaTeX expressions
 * and renders KaTeX with graceful fallbacks.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', inline = false }) => {
  if (!content) return null;

  // Split content by $$...$$ (display math) and $...$ (inline math)
  // Regex: matches $$...$$ or $...$
  const regex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
  const parts = content.split(regex);

  return (
    <span className={`inline-block ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2).trim();
          try {
            const html = katex.renderToString(formula, {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="my-2 block text-center overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <code key={index} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm text-amber-700">
                {part}
              </code>
            );
          }
        }

        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const formula = part.slice(1, -1).trim();
          try {
            const html = katex.renderToString(formula, {
              displayMode: false,
              throwOnError: false,
            });
            return (
              <span
                key={index}
                className="inline-math mx-0.5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <code key={index} className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs text-amber-700">
                {part}
              </code>
            );
          }
        }

        // Regular text, preserves newlines
        return (
          <span key={index} className="whitespace-pre-line">
            {part}
          </span>
        );
      })}
    </span>
  );
};
