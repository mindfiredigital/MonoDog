import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon, ChevronRightIcon , CheckCircleIcon, ExclamationCircleIcon, ClockIcon, XCircleIcon} from '../../icons/index';
import DOMPurify from 'dompurify';
import type { HierarchicalStep, LogViewerProps, StepItemProps } from '../../types';

interface LogLine {
  lineNumber: number;
  timestamp: string;
  content: string;
  ansiContent: string;
}

/**
 * Convert ANSI escape codes to HTML
 * Supports colors, bold, dim, italic, etc.
 */
function ansiToHtml(text: string): string {
  const ansiRegex =
    // eslint-disable-next-line no-control-regex
    /\u001b\[([0-9;]*m|K)|(\u001b\(B|\u001b\[m)/g;

  let html = '';
  let styles: Record<string, string> = {};

  const matches = Array.from(text.matchAll(ansiRegex));

  const colorMap: Record<number, string> = {
    30: '#000000',
    31: '#e06c75', // red
    32: '#98c379', // green
    33: '#e5c07b', // yellow
    34: '#61afef', // blue
    35: '#c678dd', // magenta
    36: '#56b6c2', // cyan
    37: '#abb2bf', // white
  };

  const brightColorMap: Record<number, string> = {
    90: '#5c6370',
    91: '#ff7b86',
    92: '#98c379',
    93: '#e5c07b',
    94: '#61afef',
    95: '#c678dd',
    96: '#56b6c2',
    97: '#ffffff',
  };

  let currentIndex = 0;
  let buffer = '';

  for (const match of matches) {
    // Add text before this match
    const textBefore = text.substring(currentIndex, match.index);
    buffer += escapeHtml(textBefore);

    const code = match[1];
    currentIndex = match.index! + match[0].length;

    if (code === 'm' || code === '0m') {
      // Reset
      if (buffer) {
        html += wrapWithStyles(buffer, styles);
        buffer = '';
      }
      styles = {};
    } else if (code === '1m') {
      styles.fontWeight = 'bold';
    } else if (code === '2m') {
      styles.opacity = '0.5';
    } else if (code === '3m') {
      styles.fontStyle = 'italic';
    } else if (code === '4m') {
      styles.textDecoration = 'underline';
    } else if (code.includes(';')) {
      // Multiple codes
      const codes = code.split(';').filter((c) => c);
      for (const c of codes) {
        const num = parseInt(c);
        if (num === 0) {
          if (buffer) {
            html += wrapWithStyles(buffer, styles);
            buffer = '';
          }
          styles = {};
        } else if (num === 1) {
          styles.fontWeight = 'bold';
        } else if (num === 2) {
          styles.opacity = '0.5';
        } else if (num === 3) {
          styles.fontStyle = 'italic';
        } else if (num === 4) {
          styles.textDecoration = 'underline';
        } else if (colorMap[num]) {
          styles.color = colorMap[num];
        } else if (brightColorMap[num]) {
          styles.color = brightColorMap[num];
        } else if (num >= 40 && num <= 47) {
          const bgColor = colorMap[num - 10];
          if (bgColor) styles.backgroundColor = bgColor;
        } else if (num >= 100 && num <= 107) {
          const bgColor = brightColorMap[num - 60];
          if (bgColor) styles.backgroundColor = bgColor;
        }
      }
    } else {
      const num = parseInt(code);
      if (colorMap[num]) {
        styles.color = colorMap[num];
      } else if (brightColorMap[num]) {
        styles.color = brightColorMap[num];
      }
    }
  }

  // Add remaining text
  const remaining = text.substring(currentIndex);
  buffer += escapeHtml(remaining);
  if (buffer) {
    html += wrapWithStyles(buffer, styles);
  }

  return html;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function wrapWithStyles(
  text: string,
  styles: Record<string, string>
): string {
  if (!text || Object.keys(styles).length === 0) {
    return text;
  }

  const styleStr = Object.entries(styles)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join('; ');

  return `<span style="${styleStr}">${text}</span>`;
}

function getStatusIcon(status: string, conclusion: string | null) {
  if (status === 'completed') {
    if (conclusion === 'success') {
      return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
    } else if (conclusion === 'failure') {
      return <ExclamationCircleIcon className="h-6 w-6 text-red-600" />;
    } else if (conclusion === 'cancelled') {
      return <XCircleIcon className="h-6 w-6 text-gray-600" />;
    }
  }
  return <ClockIcon className="h-6 w-6 text-blue-600" />;
}


interface StepItemProps {
  step: HierarchicalStep;
  onToggle: (stepNumber: number) => void;
  expandedSteps: Set<number>;
  stepIndex: number;
}

function StepItem({ step, onToggle, expandedSteps, stepIndex }: StepItemProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const isExpanded = expandedSteps.has(step.stepNumber);
  const hasChildren = (step.children && step.children.length > 0) || step.logs.length > 0;

  const displayedLines = useMemo(() => {
    if (showAll) return step.logs;
    return step.logs.slice(0, 1000);
  }, [step.logs, showAll]);

  useEffect(() => {
    if (step.status === 'in_progress' && isExpanded && logContainerRef.current) {
      const container = logContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [step.logs.length, isExpanded, step.status]);

  const durationSec = useMemo(() => {
    if (!step.startedAt || !step.completedAt) return 0;
    return Math.round((new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime())/100)/10;
  }, [step.startedAt, step.completedAt]);

  const indentStyle = {
    marginLeft: `${step.level * 20}px`,
  };

  return (
    <>
      <div className="border-b border-gray-200 bg-white" style={indentStyle}>
        {/* GitHub-style Step Header */}
        <button
          onClick={() => onToggle(step.stepNumber)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
        >
          {/* Expand/Collapse Icon */}
          <span className="text-gray-400 group-hover:text-gray-600 flex-shrink-0">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )
            ) : (
              <span className="h-5 w-5" />
            )}
          </span>

          {/* Step Number Badge */}
          <span className="text-xs font-bold text-gray-500 bg-gray-100 rounded px-2 py-1 min-w-fit">
            {stepIndex + 1}
          </span>

          {/* Step Name */}
          <span className="flex-1 text-left">
            <span className="text-sm font-semibold text-gray-900">{step.stepName}</span>
          </span>

          {/* Duration */}
          <div className="flex items-center gap-2 ml-2">
            {step.status === 'in_progress' && (
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            )}
            <span className="text-xs text-gray-500 font-mono">{durationSec}s</span>
          </div>
        </button>

        {/* Expanded Log Content */}
        {isExpanded && step.logs.length > 0 && (
          <div className="border-t border-gray-200 bg-[#0d1117]">
            {/* Log Container */}
            <div
              ref={logContainerRef}
              className="text-gray-300 font-mono text-xs max-h-[600px] overflow-y-auto"
            >
              {displayedLines.length === 0 ? (
                <div className="px-10 py-6 italic text-gray-500 text-center">No logs available yet</div>
              ) : (
                <div className="py-2 px-0">
                  {displayedLines.map((line, idx) => (
                    <div
                      key={`${step.stepNumber}-${line.lineNumber}`}
                      className="flex hover:bg-gray-800/40 transition-colors leading-6 group"
                    >
                      {/* Line Number Column */}
                      <span className="w-12 text-right pr-4 text-gray-600 select-none border-r border-gray-800 flex-shrink-0 group-hover:bg-gray-800/20">
                        {line.lineNumber}
                      </span>

                      {/* Timestamp Column */}
                      <span className="pl-4 pr-3 text-gray-500 select-none opacity-50 text-xs flex-shrink-0">
                        {line.timestamp.split('T')[1]?.slice(0, 8)}
                      </span>

                      {/* Log Content Column */}
                      <span
                        className="flex-1 whitespace-pre break-all pr-4 text-gray-300"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ansiToHtml(line.ansiContent)) }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Show More Button */}
              {!showAll && step.logs.length > 1000 && (
                <div className="px-4 py-2 border-t border-gray-800 text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                  >
                    Show all {step.logs.length} lines
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Render Children */}
      {isExpanded && step.children && step.children.length > 0 && (
        <>
          {step.children.map((childStep, childIdx) => (
            <StepItem
              key={childStep.stepNumber}
              step={childStep}
              onToggle={onToggle}
              expandedSteps={expandedSteps}
              stepIndex={childIdx}
            />
          ))}
        </>
      )}
    </>
  );
}
export default function LogViewer({
  steps,
  jobName,
  jobStatus,
  jobConclusion,
  gitHubLogsUrl,
}: LogViewerProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(
    new Set([steps[0]?.stepNumber])
  );

  const handleToggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };

  // Count total steps recursively
  const countSteps = (stepList: HierarchicalStep[]): number => {
    return stepList.reduce((count, step) => {
      let total = 1;
      if (step.children && step.children.length > 0) {
        total += countSteps(step.children);
      }
      return count + total;
    }, 0);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-lg font-semibold `}>
            {getStatusIcon(jobStatus, jobConclusion)}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{jobName}</h3>
            <p className="text-xs text-gray-500">
              {countSteps(steps)} step
              {countSteps(steps) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <a
          href={gitHubLogsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
        >
          View on GitHub
        </a>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto">
        {steps.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No steps available</div>
        ) : (
          steps.map((step, idx) => (
            <StepItem
              key={step.stepNumber}
              step={step}
              onToggle={handleToggleStep}
              expandedSteps={expandedSteps}
              stepIndex={idx}
            />
          ))
        )}
      </div>
    </div>
  );
}
