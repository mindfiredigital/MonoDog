import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  DocumentCheckIcon,
} from '../../../../icons/heroicons';
import { type ConfigToolbarProps } from '../types/config.types';
import { useState } from 'react';

export default function ConfigToolbar({
  isEditing,
  canEdit,
  hasSecrets,
  showSecrets,
  saving,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleSecrets,
  onRefresh,
  content,
}: ConfigToolbarProps) {
  const [copied, setCopied] = useState(false);

  // const copyToClipboard = () => {
  //   // In a real implementation, this would copy the config content
  //   navigator.clipboard.writeText('Config content copied');
  // };

  const copyToClipboard = async () => {
    try {
      // Use the content prop that's passed from ConfigInspector
      const contentToCopy = content || 'No content available';

      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 4000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      // const textArea = document.createElement('textarea');
      // textArea.value = content || 'No content available';
      // document.body.appendChild(textArea);
      // textArea.select();
      // document.execCommand('copy');
      // document.body.removeChild(textArea);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (saving) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-orange-600 bg-white border border-gray-300 rounded-lg">
            <ArrowPathIcon className="w-4 h-4 mr-1 animate-spin" />
            Saving...
          </div>
        </div>

        {/* Keep refresh available even during save */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        {/* Edit Controls */}
        {isEditing ? (
          <>
            <button
              onClick={onSaveEdit}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckIcon className="w-4 h-4 mr-1" />
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Cancel
            </button>
          </>
        ) : (
          canEdit && (
            <button
              onClick={onStartEdit}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </button>
          )
        )}

        {/* Secret Toggle */}
        {hasSecrets && (
          <button
            onClick={onToggleSecrets}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              showSecrets
                ? 'text-red-700 bg-red-100 hover:bg-red-200'
                : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
            }`}
          >
            {showSecrets ? (
              <>
                <EyeSlashIcon className="w-4 h-4 mr-1" />
                Hide Secrets
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4 mr-1" />
                Show Secrets
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            copied
              ? 'text-green-700 bg-green-100 border border-green-300'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {copied ? (
            <>
              <DocumentCheckIcon className="w-4 h-4 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
              Copy
            </>
          )}
        </button>
        {/* <button
          onClick={copyToClipboard}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
          Copy
        </button> */}

        {/* Refresh Button */}
        {/* <button
          onClick={onRefresh}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4 mr-1" />
          Refresh
        </button> */}
      </div>
    </div>
  );
}
