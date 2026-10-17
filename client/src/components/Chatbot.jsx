import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Mic, Image as ImageIcon, Bot, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const QUICK_PROMPTS = [
    'What are Akash’s top projects?',
    'What is his tech stack?',
    'Tell me about his internships'
];

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: "Hi! I'm Akash's AI Assistant. Ask me about his MERN & AI projects, internships, or click a quick question below!"
        }
    ]);
    const [input, setInput] = useState('');
    const [imageBase64, setImageBase64] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice input requires Google Chrome or Microsoft Edge.');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();
        setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImageBase64(reader.result);
        reader.readAsDataURL(file);
    };

    const sendMessage = async (overrideText) => {
        const textToSend = typeof overrideText === 'string' ? overrideText : input;
        if (!textToSend.trim() && !imageBase64) return;

        const userMsg = { role: 'user', text: textToSend || '[Image Attached]', image: imageBase64 };
        const updatedHistory = [...messages, userMsg];
        setMessages(updatedHistory);
        setInput('');
        const attachedImg = imageBase64;
        setImageBase64(null);
        setLoading(true);

        try {
            const { data } = await axios.post(`${API_URL}/api/chat`, {
                message: userMsg.text,
                history: updatedHistory,
                imageBase64: attachedImg
            });
            setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: "Akash specializes in Full-Stack MERN, Python (FastAPI), XGBoost, and GenAI. Check out his code at github.com/Mysterious-Magici! (Note: Ensure backend server on port 5000 is running)."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-xl hover:bg-indigo-700 transition transform hover:scale-105"
                >
                    <MessageSquare className="w-4 h-4" />
                    <span>Ask AI About Akash</span>
                </button>
            ) : (
                <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[30rem]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <div>
                                <h3 className="font-bold text-sm">Akash's Portfolio AI</h3>
                                <p className="text-[11px] text-indigo-100">Groq LPU • Text, Voice & Vision</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50">
                        {messages.map((m, idx) => (
                            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${m.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                        : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    {m.image && (
                                        <img src={m.image} alt="Preview" className="w-full h-24 object-cover rounded-lg mb-2" />
                                    )}
                                    <p className="whitespace-pre-wrap">{m.text}</p>
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-xs text-indigo-600 font-medium animate-pulse">AI is typing...</div>}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Quick Prompt Chips */}
                    <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200/70 flex gap-1.5 overflow-x-auto no-scrollbar">
                        {QUICK_PROMPTS.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => sendMessage(q)}
                                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition"
                            >
                                <Sparkles className="w-3 h-3 text-indigo-500" />
                                <span>{q}</span>
                            </button>
                        ))}
                    </div>

                    {imageBase64 && (
                        <div className="px-3 py-1.5 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between text-xs text-indigo-700">
                            <span>Image ready for Llama-4 Vision</span>
                            <button onClick={() => setImageBase64(null)} className="font-bold text-rose-500">
                                Remove
                            </button>
                        </div>
                    )}

                    {/* Input Bar */}
                    <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                            title="Upload Job Description Screenshot"
                        >
                            <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleVoiceInput}
                            className={`p-2 rounded-lg ${isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                                }`}
                            title="Voice Dictation"
                        >
                            <Mic className="w-4 h-4" />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask about projects, skills, GitHub..."
                            className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            onClick={() => sendMessage()}
                            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}