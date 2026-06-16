import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <Card className="w-full max-w-md p-6 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {this.props.title || 'Something went wrong'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {this.props.message || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <div className="flex justify-center pt-1">
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="size-4" />
                <span>Refresh Page</span>
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
