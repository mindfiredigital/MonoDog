import {
  DocumentTextIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { type PackageDetail } from '../types/packages.types';
import { useState } from 'react';
import { monorepoService } from '../../../../services/monorepoService';

interface ConfigurationTabProps {
  packageData: PackageDetail;
}

export default function ConfigurationTab({
  packageData,
}: ConfigurationTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedConfig, setEditedConfig] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [copiedScript, setCopiedScript] = useState<string | null>(null); // Track which script was copied
  const [isConfigCopied, setIsConfigCopied] = useState(false);

  console.log('Package Data:', packageData);
  const generatePackageJson = () => {
    // Create a proper JavaScript object
    const configObject = {
      name: packageData.name,
      version: packageData.version,
      description: packageData.description || '',
      license: packageData.license || '',
      repository: packageData.repository || {},
      scripts: packageData.scripts || {},
      dependencies: packageData.dependencies || {},
      devDependencies: packageData.devDependencies || {},
      peerDependencies: packageData.peerDependencies || {},
    };

    // Convert to properly formatted JSON string
    return JSON.stringify(configObject, null, 2);
  };

  // Initialize editedConfig when component mounts or packageData changes
  useState(() => {
    setEditedConfig(generatePackageJson());
  });

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedConfig(generatePackageJson());
    setSaveMessage('');
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedConfig(generatePackageJson());
    setSaveMessage('');
  };

  const handleSaveClick = async () => {
    if (!editedConfig.trim()) {
      setSaveMessage('Configuration cannot be empty');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      console.log('💾 Saving package configuration...');

      // Use the MonorepoService to update the package configuration
      const result = await monorepoService.updatePackageConfiguration(
        packageData.name,
        editedConfig,
        packageData.path as string
      );

      if (result.success) {
        setSaveMessage('Configuration updated successfully!');
        setIsEditing(false);
        console.log('✅ Update successful:', result);

        // Optionally trigger a refresh of package data
        // You might want to call a callback prop here to refresh parent state
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('❌ Error saving configuration:', error);
      setSaveMessage(
        error instanceof Error
          ? error.message
          : 'Failed to save configuration. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedConfig(e.target.value);
    // Clear message when user starts typing again
    if (saveMessage) setSaveMessage('');
  };

  const handleCopyToClipboard = async (
    content: string,
    type: 'config' | 'script',
    scriptName?: string
  ) => {
    try {
      await navigator.clipboard.writeText(content);

      if (type === 'config') {
        setIsConfigCopied(true);
        setTimeout(() => setIsConfigCopied(false), 4000);
      } else if (type === 'script' && scriptName) {
        setCopiedScript(scriptName);
        setTimeout(() => setCopiedScript(null), 4000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');

        if (type === 'config') {
          setIsConfigCopied(true);
          setTimeout(() => setIsConfigCopied(false), 2000);
        } else if (type === 'script' && scriptName) {
          setCopiedScript(scriptName);
          setTimeout(() => setCopiedScript(null), 2000);
        }
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        if (type === 'config') {
          setSaveMessage('Failed to copy to clipboard');
        }
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="py-6">
      {/* Scripts Section - Unchanged */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <DocumentTextIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Package Scripts</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(packageData.scripts).map(([scriptName, command]) => (
            <div
              key={scriptName}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">
                  {scriptName}
                </h4>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      handleCopyToClipboard(command, 'script', scriptName)
                    }
                    className={`text-sm flex items-center space-x-1 ${
                      copiedScript === scriptName
                        ? 'text-green-600'
                        : 'text-gray-600 hover:text-gray-700'
                    }`}
                    title="Copy command to clipboard"
                  >
                    {copiedScript === scriptName ? (
                      <>
                        <ClipboardDocumentCheckIcon className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button className="text-blue-600 hover:text-blue-500 text-sm">
                    Run
                  </button>
                </div>
              </div>
              <code className="text-xs text-gray-600 bg-gray-100 p-2 rounded block overflow-x-auto">
                {command}
              </code>
            </div>
          ))}
        </div>

        {Object.keys(packageData.scripts).length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📝</div>
            <p className="text-gray-500">No scripts configured</p>
          </div>
        )}
      </div>

      {/* Package.json Preview/Editor */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Package Configuration
          </h3>
          {!isEditing && (
            <div className="text-sm text-gray-500">Read-only preview</div>
          )}
        </div>

        {isEditing ? (
          // Editable Textarea
          <div className="space-y-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
              <textarea
                value={editedConfig}
                onChange={handleConfigChange}
                className="w-full h-96 bg-gray-900 text-gray-100 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                spellCheck="false"
              />
            </div>

            {/* Save Message */}
            {saveMessage && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  saveMessage.includes('successfully')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {saveMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
              <button
                onClick={handleCancelClick}
                disabled={isSaving}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">{generatePackageJson()}</pre>
            </div>

            {isEditing ? (
              // Editable Textarea
              <div className="space-y-4">
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                  <textarea
                    value={editedConfig}
                    onChange={handleConfigChange}
                    className="w-full h-96 bg-gray-900 text-gray-100 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    spellCheck="false"
                  />
                </div>

                {/* Save Message */}
                {saveMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      saveMessage.includes('successfully')
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {saveMessage}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-sm flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                  <button
                    onClick={handleCancelClick}
                    disabled={isSaving}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Read-only Preview
              <>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{generatePackageJson()}</pre>
                </div>

                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleEditClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Edit Configuration
                  </button>
                  <button
                    onClick={() =>
                      handleCopyToClipboard(
                        isEditing ? editedConfig : generatePackageJson(),
                        'config'
                      )
                    }
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm flex items-center space-x-2"
                  >
                    {isConfigCopied ? (
                      <>
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardIcon className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
