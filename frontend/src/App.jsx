import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>DemandWise</h1>
        <span className="subtitle">E-Commerce Demand Intelligence</span>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;