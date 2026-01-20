import { SettingsComponentProps } from '../types/config.types';

export default function BrandingSettings({
  config,
  onConfigChange,
}: SettingsComponentProps) {
  const handleBrandingChange = (field: string, value: string) => {
    onConfigChange({
      branding: { ...config.branding, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Branding & Appearance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              type="text"
              value={config.branding?.logo || ''}
              onChange={e => handleBrandingChange('logo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/logo.png"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL to your company logo
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={config.branding?.primaryColor || '#3B82F6'}
                onChange={e =>
                  handleBrandingChange('primaryColor', e.target.value)
                }
                className="h-10 w-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={config.branding?.primaryColor || '#3B82F6'}
                onChange={e =>
                  handleBrandingChange('primaryColor', e.target.value)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#3B82F6"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Primary brand color for buttons and accents
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={config.branding?.secondaryColor || '#1E40AF'}
                onChange={e =>
                  handleBrandingChange('secondaryColor', e.target.value)
                }
                className="h-10 w-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={config.branding?.secondaryColor || '#1E40AF'}
                onChange={e =>
                  handleBrandingChange('secondaryColor', e.target.value)
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#1E40AF"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Secondary color for hover states and highlights
            </p>
          </div>
        </div>

        {/* Color Preview */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Color Preview
          </h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-lg border border-gray-300"
                style={{
                  backgroundColor: config.branding?.primaryColor || '#3B82F6',
                }}
              />
              <span className="text-sm text-gray-600">Primary</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-lg border border-gray-300"
                style={{
                  backgroundColor: config.branding?.secondaryColor || '#1E40AF',
                }}
              />
              <span className="text-sm text-gray-600">Secondary</span>
            </div>
            <button
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{
                backgroundColor: config.branding?.primaryColor || '#3B82F6',
              }}
            >
              Sample Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
