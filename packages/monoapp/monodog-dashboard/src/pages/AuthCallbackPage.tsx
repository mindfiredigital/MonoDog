import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          setError(`${error}: ${errorDescription}`);
          setIsProcessing(false);
          return;
        }

        if (!code || !state) {
          setError('Missing authorization code or state');
          setIsProcessing(false);
          return;
        }

        // Get the session token from the OAuth callback
        const apiUrl = (window as any).ENV?.API_URL ?? 'http://localhost:8999';
        const API_BASE = `${apiUrl}/api`;

        const response = await fetch(`${API_BASE}/auth/callback?code=${code}&state=${state}`);

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || 'Authentication failed');
          setIsProcessing(false);
          return;
        }

        const data = await response.json();

        if (!data.success || !data.sessionToken) {
          setError('Failed to complete authentication');
          setIsProcessing(false);
          return;
        }

        // Use the auth context to handle the session
        const authContext = (window as any).__authContext;
        if (authContext && authContext.handleOAuthCallback) {
          const success = await authContext.handleOAuthCallback(data.sessionToken, data.permission);
          if (success) {
            // Redirect to the app
            const redirectUrl = data.redirectUrl || '/';
            navigate(redirectUrl);
          } else {
            setError('Failed to store session');
          }
        } else {
          setError('Auth context not available');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(message);
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-5">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm text-center p-10">
        {isProcessing ? (
          <>
            {/* Spinner */}
            <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto my-5"></div>
            <h2 className="text-2xl font-bold text-gray-900 mt-5 mb-2">Completing Authentication...</h2>
            <p className="text-gray-700 text-sm leading-relaxed">Please wait while we verify your GitHub account.</p>
          </>
        ) : error ? (
          <>
            <div className="text-5xl mb-5">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Authentication Failed</h2>
            <p className="text-gray-700 text-sm leading-relaxed mb-5">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Return to Login
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default AuthCallbackPage;
