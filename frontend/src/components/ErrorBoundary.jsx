import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a12] p-8">
          <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-12 max-w-md w-full text-center shadow-xl">
            <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black mb-4">{this.props.title || t('errorBoundary.title')}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              {this.props.message || t('errorBoundary.message')}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm hover:opacity-80 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              {t('errorBoundary.refresh')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
