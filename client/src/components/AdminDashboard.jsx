import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
    ShieldCheck,
    User,
    Trash2,
    LogOut,
    ArrowLeft,
    Mail,
    CheckCircle,
    Clock,
    MessageSquareReply
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
    const [token, setToken] = useState(localStorage.getItem('portfolioToken') || '');
    const [currentUser, setCurrentUser] = useState(
        JSON.parse(localStorage.getItem('portfolioUser') || 'null')
    );

    // Auth UI state: 'user' or 'admin'
    const [loginRole, setLoginRole] = useState('user');
    const [isRegistering, setIsRegistering] = useState(false);
    const [form, setForm] = useState({ name: '', identifier: '', password: '' });
    const [error, setError] = useState('');

    // Dashboard state
    const [messages, setMessages] = useState([]);
    const [replyDrafts, setReplyDrafts] = useState({});

    const handleLogout = () => {
        localStorage.removeItem('portfolioToken');
        localStorage.removeItem('portfolioUser');
        setToken('');
        setCurrentUser(null);
        setMessages([]);
    };

    const fetchMessages = async (authToken, role) => {
        try {
            const endpoint = role === 'admin' ? '/api/admin/messages' : '/api/user/messages';
            const { data } = await axios.get(`${API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setMessages(data);
        } catch (err) {
            handleLogout();
        }
    };

    useEffect(() => {
        if (token && currentUser) {
            fetchMessages(token, currentUser.role);
        }
    }, [token]);

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (loginRole === 'user' && isRegistering) {
                const { data } = await axios.post(`${API_URL}/api/auth/register`, {
                    name: form.name,
                    email: form.identifier,
                    password: form.password
                });
                localStorage.setItem('portfolioToken', data.token);
                localStorage.setItem('portfolioUser', JSON.stringify(data.user));
                setToken(data.token);
                setCurrentUser(data.user);
            } else {
                const { data } = await axios.post(`${API_URL}/api/auth/login`, {
                    identifier: form.identifier,
                    password: form.password,
                    loginType: loginRole
                });
                localStorage.setItem('portfolioToken', data.token);
                localStorage.setItem('portfolioUser', JSON.stringify(data.user));
                setToken(data.token);
                setCurrentUser(data.user);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Check your credentials.');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const adminReply = replyDrafts[id] !== undefined ? replyDrafts[id] : undefined;
            const { data } = await axios.patch(
                `${API_URL}/api/admin/messages/${id}`,
                { status, ...(adminReply !== undefined && { adminReply }) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages((prev) => prev.map((m) => (m._id === id ? data : m)));
        } catch (err) {
            alert('Failed to update message.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/admin/messages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages((prev) => prev.filter((msg) => msg._id !== id));
        } catch (err) {
            alert('Failed to delete message.');
        }
    };

    // ================= 1. LOGIN / REGISTER SCREEN ================= //
    if (!token || !currentUser) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
                    {/* Role Switcher Tabs */}
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6">
                        <button
                            type="button"
                            onClick={() => {
                                setLoginRole('user');
                                setError('');
                            }}
                            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${loginRole === 'user' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            <span>Normal User</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setLoginRole('admin');
                                setIsRegistering(false);
                                setError('');
                            }}
                            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${loginRole === 'admin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'
                                }`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Portal</span>
                        </button>
                    </div>

                    <h2 className="text-2xl font-extrabold text-center text-slate-900 mb-1">
                        {loginRole === 'admin'
                            ? 'Admin JWT Sign In'
                            : isRegistering
                                ? 'Create User Account'
                                : 'Recruiter / User Login'}
                    </h2>
                    <p className="text-xs text-center text-slate-500 mb-6">
                        {loginRole === 'admin'
                            ? 'Manage all portfolio inquiries and post official replies.'
                            : 'Track the status of messages you sent to Akash.'}
                    </p>

                    {error && (
                        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-xl mb-4 text-center">
                            {error}
                        </p>
                    )}

                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                        {loginRole === 'user' && isRegistering && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                            />
                        )}

                        <input
                            type={loginRole === 'admin' ? 'text' : 'email'}
                            placeholder={loginRole === 'admin' ? 'Admin Username (e.g., akash_admin)' : 'Your Email Address'}
                            required
                            value={form.identifier}
                            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            required
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                        />

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20"
                        >
                            {loginRole === 'admin'
                                ? 'Sign In as Admin'
                                : isRegistering
                                    ? 'Sign Up & Track Messages'
                                    : 'Sign In as User'}
                        </button>
                    </form>

                    {loginRole === 'user' && (
                        <button
                            type="button"
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="w-full mt-4 text-xs font-semibold text-indigo-600 hover:underline text-center"
                        >
                            {isRegistering ? 'Already have an account? Sign In' : 'New visitor? Create a free User account'}
                        </button>
                    )}

                    <Link
                        to="/"
                        className="mt-6 flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-indigo-600"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Portfolio
                    </Link>
                </div>
            </div>
        );
    }

    // ================= 2. LOGGED-IN DASHBOARD (USER VS ADMIN) ================= //
    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 mb-1">
                            {currentUser.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                            <span>{currentUser.role === 'admin' ? 'Administrator Mode' : 'Normal User Mode'}</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900">
                            {currentUser.role === 'admin' ? 'All Portfolio Inquiries' : `Welcome, ${currentUser.name}`}
                        </h1>
                        <p className="text-xs text-slate-500">
                            {currentUser.role === 'admin'
                                ? `Total Messages in MongoDB: ${messages.length}`
                                : `Showing inquiries sent from ${currentUser.email}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/"
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold"
                        >
                            ← Portfolio Home
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500 text-sm">
                            {currentUser.role === 'admin'
                                ? 'No messages in MongoDB yet.'
                                : 'You have not sent any messages with this email yet. Use the Get In Touch form on the homepage!'}
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg._id}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Mail className="w-4 h-4 text-indigo-600" />
                                        <span className="font-bold text-slate-900 text-sm">{msg.name}</span>
                                        <span className="text-xs text-indigo-600 font-medium">({msg.email})</span>
                                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                            {msg.category}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            • {new Date(msg.createdAt).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Status Badge */}
                                    <span
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${msg.status === 'Replied'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : msg.status === 'Reviewed'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        {msg.status === 'Replied' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                        <span>{msg.status || 'Pending'}</span>
                                    </span>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-700">Subject: {msg.subject}</p>
                                    <p className="text-sm text-slate-600 mt-1">{msg.message}</p>
                                </div>

                                {/* Display Admin Reply if Present */}
                                {msg.adminReply && (
                                    <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-slate-700">
                                        <p className="font-bold text-indigo-700 mb-1 flex items-center gap-1">
                                            <MessageSquareReply className="w-3.5 h-3.5" /> Reply from Akash Karmakar:
                                        </p>
                                        <p>{msg.adminReply}</p>
                                    </div>
                                )}

                                {/* Admin-Only Controls */}
                                {currentUser.role === 'admin' && (
                                    <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Write an official reply to this user..."
                                                value={replyDrafts[msg._id] ?? msg.adminReply ?? ''}
                                                onChange={(e) => setReplyDrafts({ ...replyDrafts, [msg._id]: e.target.value })}
                                                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                                            />
                                            <button
                                                onClick={() => handleStatusUpdate(msg._id, 'Replied')}
                                                className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                                            >
                                                Send Reply
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(msg._id, 'Reviewed')}
                                                className="px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100"
                                            >
                                                Mark Reviewed
                                            </button>
                                            <button
                                                onClick={() => handleDelete(msg._id)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                                                title="Delete Message"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}