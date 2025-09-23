import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { Auth0Provider } from '@auth0/auth0-react';
import  UserContextProvider  from './contexts/UserContextProvider.jsx'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN_NAME}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_API_IDENTIFIER, // optional if you call backend APIs
      }}
      useRefreshTokens={true}       // keeps session active
      cacheLocation="localstorage"  // persist login across tabs
    >
      <UserContextProvider>
        <App />
      </UserContextProvider>
    </Auth0Provider>
  </StrictMode>

)
