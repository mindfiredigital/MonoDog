import { ConfigEditorProps } from '../types/config.types';
import { maskSecrets, detectLanguage } from '../utils/config.utils';
import { DocumentIcon } from '@heroicons/react/24/outline';

export default function ConfigEditor({
  config,
  isEditing,
  editValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onValueChange,
  showSecrets,
  onToggleSecrets,
}: ConfigEditorProps) {
  if (!config) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-2"><DocumentIcon className="w-6 h-6 text-primary-600" /></div>
          <p className="text-gray-500">
            Select a configuration file to view or edit
          </p>
        </div>
      </div>
    );
  }

  const language = detectLanguage(config.name);
  const displayContent = showSecrets
    ? config.content
    : maskSecrets(config.content);

  return (
    <div className="bg-white rounded-lg shadow border h-full flex flex-col">
      {/* File Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="text-2xl"><DocumentIcon className="w-6 h-6 text-primary-600" /></div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{config.name}</h3>
            <p className="text-sm text-gray-500">{config.path}</p>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-4">
        {isEditing ? (
          <div className="h-full">
            <textarea
              value={editValue}
              onChange={e => onValueChange(e.target.value)}
              className="w-full h-full font-mono text-sm border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter configuration content..."
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="h-full">
            <pre className="w-full h-full font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto whitespace-pre-wrap">
              <code className={`language-${language}`}>{displayContent}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Editor Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Language: {language.toUpperCase()}</span>
            <span>Size: {config.content.length} characters</span>
            {config.hasSecrets && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔒 Contains secrets
              </span>
            )}
          </div>
          <div>
            {isEditing ? (
              <span className="text-blue-600 font-medium">Editing mode</span>
            ) : config.isEditable ? (
              <span className="text-green-600">Editable</span>
            ) : (
              <span className="text-gray-400">Read-only</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
