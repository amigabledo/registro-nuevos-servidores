import './instrument'; // Debe ejecutarse antes de cualquier otro import

import React from 'react';
import ReactDOM from 'react-dom/client';
import { reactErrorHandler } from '@sentry/react';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!, {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
