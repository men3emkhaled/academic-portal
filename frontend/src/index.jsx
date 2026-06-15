import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./config/microsoftAuthConfig";
import './i18n';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '407444968316-d0mmu1duk58gcschp0udu4vv5vavua3o.apps.googleusercontent.com';

const renderApp = (msalInstance) => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      {msalInstance ? (
        <MsalProvider instance={msalInstance}>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <App />
          </GoogleOAuthProvider>
        </MsalProvider>
      ) : (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      )}
    </React.StrictMode>
  );
};

let msalInstance = null;

try {
  msalInstance = new PublicClientApplication(msalConfig);
  msalInstance.initialize().then(() => {
    renderApp(msalInstance);
  }).catch((error) => {
    console.error("MSAL Initialization failed. Rendering app anyway to avoid black screen.", error);
    renderApp(msalInstance);
  });
} catch (error) {
  console.error("MSAL creation failed (likely localStorage blocked). Rendering app without MSAL.", error);
  renderApp(null);
}