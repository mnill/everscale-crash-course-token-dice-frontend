import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {EverWalletProvider} from "./providers/EverWalletProvider";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <EverWalletProvider>
      <App />
    </EverWalletProvider>
  </React.StrictMode>
);