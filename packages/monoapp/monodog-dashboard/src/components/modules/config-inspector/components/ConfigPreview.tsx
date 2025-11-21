import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { ConfigPreviewProps } from '../types/config.types';
import { maskSecrets, formatJson } from '../utils/config.utils';

export default function ConfigPreview({
  content,
  language,
  showSecrets,
  onToggleSecrets,
}: ConfigPreviewProps) {
  const displayContent = showSecrets ? content : maskSecrets(content);
  const formattedContent =
    language === 'json' ? formatJson(displayContent) : displayContent;

  const getLanguageDisplayName = (lang: string) => {
    const names: Record<string, string> = {
      json: 'JSON',
      yaml: 'YAML',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      env: 'Environment',
      markdown: 'Markdown',
      xml: 'XML',
      toml: 'TOML',
      text: 'Plain Text',
    };
    return names[lang] || lang.toUpperCase();
  };

  const getSyntaxHighlightClass = (lang: string) => {
    // In a real implementation, you might use a syntax highlighting library
    // like Prism.js or highlight.js
    return `language-${lang}`;
  };

  return (
    <div className="bg-white rounded-lg shadow border h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">
            {getLanguageDisplayName(language)} Preview
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {content.split('\n').length} lines
          </span>
        </div>

        {onToggleSecrets && (
          <button
            onClick={onToggleSecrets}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showSecrets ? (
              <>
                <EyeSlashIcon className="w-3 h-3 mr-1" />
                Hide
              </>
            ) : (
              <>
                <EyeIcon className="w-3 h-3 mr-1" />
                Show
              </>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <pre
          className={`h-full p-4 text-sm font-mono bg-gray-50 overflow-auto ${getSyntaxHighlightClass(language)}`}
        >
          <code className="whitespace-pre-wrap break-words">
            {formattedContent}
          </code>
        </pre>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formattedContent.length} characters</span>
          <span>Read-only preview</span>
        </div>
      </div>
    </div>
  );
}
