import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectsAndSkills from './components/ProjectsAndSkills';
import Contact from './components/Contact';
import Chatbot from './components/Chatbot';
import AdminDashboard from './components/AdminDashboard';

const CURRENT_YEAR = new Date().getFullYear();

function PortfolioHome() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <Hero />
      <ProjectsAndSkills />
      <Contact />
      <Chatbot />
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-100">
        © {CURRENT_YEAR} Akash Karmakar. Built with MERN Stack, Three.js & Groq AI.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PortfolioHome />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}