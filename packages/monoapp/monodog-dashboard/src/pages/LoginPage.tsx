import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/auth-context';

export function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [isInitiating, setIsInitiating] = useState(false);

  const handleLoginClick = async () => {
    setIsInitiating(true);
    await login();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br p-5">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-8 text-center">
          <h1 className="text-4xl font-bold m-0">MonoDog</h1>
          <p className="text-sm opacity-90 font-medium mt-2 m-0">Monorepo Analytics & Management</p>
        </div>

        {/* Content */}
        <div className="p-10">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Sign in to your account</h2>

          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm border-l-4 border-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleLoginClick}
            disabled={isLoading || isInitiating}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-primary-600 text-white rounded-lg font-semibold text-base cursor-pointer transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:bg-primary-700 hover:enabled:-translate-y-0.5 hover:enabled:shadow-lg mb-8"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-8 text-gray-400 text-xs font-semibold uppercase tracking-widest">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span>GitHub OAuth Authentication</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Scopes Box */}
          <div className="bg-primary-50 rounded-lg p-5 border-l-4 border-primary-500">
            <h4 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">Requested Permissions</h4>
            <ul className="m-0 p-0 list-none space-y-2">
              <li className="text-sm text-gray-700">
                <code className="bg-white text-primary-500 px-1.5 py-0.5 rounded text-xs font-semibold">read:user</code> - Read your profile information
              </li>
              <li className="text-sm text-gray-700">
                <code className="bg-white text-primary-500 px-1.5 py-0.5 rounded text-xs font-semibold">user:email</code> - Access your email address
              </li>
              <li className="text-sm text-gray-700">
                <code className="bg-white text-primary-500 px-1.5 py-0.5 rounded text-xs font-semibold">repo</code> - Access your repositories (required for private repos)
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-10 py-5 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 leading-relaxed m-0">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
