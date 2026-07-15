import { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '../icons/heroicons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="bg-white rounded-xl shadow-lg border border-red-100 p-8 max-w-lg w-full text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Something went wrong
            </h2>
            <p className="text-gray-600">
              An unexpected error occurred in this section of the dashboard.
            </p>
            {this.state.error && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left overflow-auto max-h-48 text-sm font-mono text-gray-800 border border-gray-200">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full btn-primary px-4 py-2"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
