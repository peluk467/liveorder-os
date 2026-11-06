import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { PreLivePage } from './pages/PreLivePage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { PostLivePage } from './pages/PostLivePage';
import { SimuladorChatPage } from './pages/SimuladorChatPage';
import { AuditoriaPage } from './pages/AuditoriaPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<PreLivePage />} />
            <Route path="/monitor" element={<LiveMonitorPage />} />
            <Route path="/post-live" element={<PostLivePage />} />
            <Route path="/auditoria" element={<AuditoriaPage />} />
            <Route path="/simulador-chat" element={<SimuladorChatPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
