import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Component boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#FFF8F8] border border-rose-200 rounded-2xl p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {this.props.fallbackTitle || 'Component Visual Unavailable'}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {this.state.error?.message || 'Using local synthetic fallback visualization mode.'}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center space-x-1 text-xs font-bold text-[#2E4D37] bg-[#E3EFE5] hover:bg-[#D5E6D8] px-3 py-1.5 rounded-lg border border-[#C3DCC8] transition-all"
          >
            <RefreshCw size={12} />
            <span>Reset View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
