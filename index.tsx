
import './polyfill'; // 1. Polyfills first
import './src/styles.css'; // 2. Styles second (Tailwind)
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

const startApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Failed to find the root element');
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-brand-blue" size={40} /></div>}>
            <App />
          </Suspense>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Failed to render the app:', err);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
