import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/auth-context';
import { GithubIcon } from '../icons/heroicons';

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
            <GithubIcon></GithubIcon>
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
