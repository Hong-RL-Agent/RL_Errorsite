import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError || this.props.forcedError) {
      return (
        <div style={{
          maxWidth: '600px',
          margin: '60px auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--accent-rose)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.15)',
            color: 'var(--accent-rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)' }}>
            문제가 발생했습니다.
          </h2>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            프로젝트 데이터를 불러오는 중 오류가 발생했습니다.
          </p>

          <button
            onClick={this.handleRetry}
            className="btn-primary"
            style={{ marginTop: '8px', padding: '12px 24px' }}
          >
            <RefreshCw size={16} />
            <span>다시 시도</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
