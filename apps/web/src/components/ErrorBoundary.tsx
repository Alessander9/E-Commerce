import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg border border-gray-100 space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-xl font-black text-navy">Algo salió mal</h2>
            <p className="text-sm text-gray-500">
              Ha ocurrido un error inesperado. Por favor intenta de nuevo.
            </p>
            {this.state.error && (
              <p className="text-xs text-gray-400 font-mono bg-gray-50 rounded-xl p-3 max-h-24 overflow-auto">
                {this.state.error.message}
              </p>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" />
                Reintentar
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-5 py-2.5 rounded-2xl bg-gray-100 text-navy font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                Inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
