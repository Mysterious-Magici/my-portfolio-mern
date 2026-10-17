import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Send, CheckCircle2, AlertCircle, MapPin, Briefcase, Shield } from 'lucide-react';
import Github from './Github';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CATEGORIES = ['Hiring / Full-Time', 'Internship Opportunity', 'Freelance Project', 'Tech Collaboration'];

export default function Contact() {
    const savedUser = JSON.parse(localStorage.getItem('portfolioUser') || 'null');

    const [formData, setFormData] = useState({
        name: savedUser?.role === 'user' ? savedUser.name : '',
        email: savedUser?.role === 'user' ? savedUser.email : '',
        category: 'Hiring / Full-Time',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', text: '' });

        try {
            await axios.post(`${API_URL}/api/contact`, formData);
            setStatus({
                type: 'success',
                text: 'Success! You can track reply in the User Login Portal.'
            });
            setFormData((prev) => ({ ...prev, subject: '', message: '' }));
        } catch (error) {
            setStatus({
                type: 'error',
                text: error.response?.data?.error || 'Could not send message. Make sure the backend server is running.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="contact" className="py-20 bg-gradient-to-b from-slate-50 to-indigo-50/50">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-5 gap-10 items-start">
                    {/* Left Column: Direct Info Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                                Direct Communication
                            </span>
                            <h2 className="text-3xl font-extrabold text-slate-900 mt-1 mb-3">
                                Let's Build Something Impactful
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Open to entry-level opportunities in software development, AI/ML, and data analytics. Let's connect to discuss a role, project, or technical collaboration.
                            </p>
                        </div>

                        <div className="space-y-3.5">
                            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Current Status</p>
                                    <p className="text-sm font-bold text-slate-800">Open to Software & Data Roles</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Location</p>
                                    <p className="text-sm font-bold text-slate-800">Sonamukhi, West Bengal, India • Open to Remote & Relocation</p>
                                </div>
                            </div>

                            <a
                                href="https://github.com/Mysterious-Magici"
                                target="_blank"
                                rel="noreferrer"
                                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 shadow-sm flex items-center gap-4 transition"
                            >
                                <div className="p-3 rounded-xl bg-slate-900 text-white">
                                    <Github className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">GitHub Repositories</p>
                                    <p className="text-sm font-bold text-indigo-600">github.com/Mysterious-Magici</p>
                                </div>
                            </a>
                        </div>

                        <div className="p-4 rounded-2xl bg-indigo-900 text-white text-xs leading-relaxed space-y-2">
                            <div className="flex items-center gap-2 font-bold text-indigo-200">
                                <Shield className="w-4 h-4" />
                                <span>Track Your Inquiry Status</span>
                            </div>
                            <p className="text-indigo-100">
                                Sign in as a <strong>Normal User</strong> using the same email address to check if your message is <em>Pending</em>, <em>Reviewed</em>, or <em>Replied</em>.
                            </p>
                            <Link to="/admin" className="inline-block text-white font-semibold underline pt-1">
                                Open User / Admin Portal →
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Interactive Contact Form */}
                    <div className="lg:col-span-3 bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 md:p-10">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Send Me a Message</h3>

                        {/* Category Selector Pills */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                                Inquiry Category
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        type="button"
                                        key={cat}
                                        onClick={() => setFormData({ ...formData, category: cat })}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${formData.category === cat
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {status.text && (
                            <div
                                className={`flex items-center gap-2 p-4 rounded-xl mb-5 text-xs font-medium ${status.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}
                            >
                                {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                <span>{status.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Your Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Recruiter / Client Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="you@company.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Subject</label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Role / Project Subject"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Message *</label>
                                <textarea
                                    rows="4"
                                    required
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Share role details, tech stack requirements, or interview timings..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                <span>{loading ? 'Saving to MongoDB...' : 'Send Inquiry'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}