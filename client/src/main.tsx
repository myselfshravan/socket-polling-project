import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { UserProvider } from './contexts/UserContext';
import { PollProvider } from './contexts/PollContext';
import { Toaster } from './components/ui/toaster';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <PollProvider>
          <App />
          <Toaster />
        </PollProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
