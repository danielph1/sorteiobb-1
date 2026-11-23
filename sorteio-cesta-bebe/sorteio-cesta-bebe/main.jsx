import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
const Router = import.meta.env.MODE === 'demo' ? MemoryRouter : BrowserRouter;
import App from './App.jsx';
import './styles.css';
import './redesign.css';
createRoot(document.getElementById('root')).render(<React.StrictMode><Router><App /></Router></React.StrictMode>);
