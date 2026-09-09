import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  temErro: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { temErro: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { temErro: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Erro não tratado na interface:', error, info);
  }

  render(): ReactNode {
    if (this.state.temErro) {
      return (
        <div role="alert" className="min-h-screen bg-coffee-50 flex items-center justify-center px-4">
          <div className="max-w-sm text-center">
            <h1 className="text-xl font-semibold text-coffee-900 mb-2">Algo deu errado</h1>
            <p className="text-coffee-700">
              Não foi possível carregar esta página. Tente recarregar ou voltar mais tarde.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
