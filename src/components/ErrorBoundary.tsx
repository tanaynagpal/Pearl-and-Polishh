import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Props;
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[UNCAUGHT CLIENT ERROR]', error, errorInfo);
  }

  public handleReset = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#2D040E] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#3D0513] border border-red-500/30 rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#D4AF37] mb-2">Something Went Wrong</h1>
            <p className="text-xs text-white/70 mb-6">
              An unexpected application error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-left mb-6 overflow-x-auto max-h-32">
                <p className="text-[10px] font-mono text-red-300 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-3 px-6 bg-[#D4AF37] text-[#2D040E] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#b8952b] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
