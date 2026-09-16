import React from 'react';
import {ErrorBoundary} from './src/app/ErrorBoundary';
import {AppRoot} from './src/app/navigation';

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoot />
    </ErrorBoundary>
  );
}
