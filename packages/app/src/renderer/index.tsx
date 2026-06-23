import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from '@/ui';
import '@/ui/styles/global.css';
import '@/ui/styles/sprites.css';

const App: React.FC = () => {
  return <AppRouter />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
