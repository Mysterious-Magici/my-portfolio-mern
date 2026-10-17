import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, UserCheck, ShieldCheck } from 'lucide-react';
import Github from './Github';

export default function Navbar() {
    const savedUser = JSON.parse(localStorage.getItem('portfolioUser') || 'null');

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <a href="#" className="flex items-center gap-2 font-extrabold text-xl text-slate-900">
                    <Code2 className="w-6 h-6 text-indigo-600" />
                    <span>Akash<span className="text-indigo-600">.dev</span></span>
                </a>

                <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
                    <a href="#about" className="hover:text-indigo-600 transition">About</a>
                    <a href="#projects" className="hover:text-indigo-600 transition">Projects & Skills</a>
                    <a href="#contact" className="hover:text-indigo-600 transition">Get In Touch</a>
                    <a
                        href="https://github.com/Mysterious-Magici"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 transition"
                    >
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                    </a>
                </nav>

                <div className="flex items-center gap-3">
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60 transition"
                    >
                        {savedUser?.role === 'admin' ? (
                            <>
                                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                                <span>Admin Panel</span>
                            </>
                        ) : savedUser ? (
                            <>
                                <UserCheck className="w-4 h-4 text-emerald-600" />
                                <span>{savedUser.name.split(' ')[0]}'s Portal</span>
                            </>
                        ) : (
                            <>
                                <UserCheck className="w-4 h-4" />
                                <span>User / Admin Login</span>
                            </>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}