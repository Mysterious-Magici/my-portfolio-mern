import React, { useState } from 'react';
import { Layers, Cpu, BarChart3, ExternalLink, Code } from 'lucide-react';
import Github from './Github';

const PROJECTS = [
    {
        title: 'Anuman AI: Agentic Document & Tabular Intelligence Platform',
        category: 'Agentic AI & ML',
        stack: 'Python • LangGraph • Streamlit • Agentic LLM',
        description:
            'Open-source AI data profiling and autonomous analytics agent that inspects datasets, detects anomalies, and generates visual insights.',
        badge: 'Agentic AI',
        github: 'https://github.com/Mysterious-Magici/Anuman-AI',
        live: 'https://anuman-ai-analytics.streamlit.app/'
    },
    {
        title: 'SmartFlow Portal',
        category: 'MERN Stack',
        stack: 'React.js • Node.js • Express.js • MongoDB • Netlify',
        description:
            'Full-stack customer enquiry and workflow management web application with automated status tracking and responsive dashboards.',
        badge: 'Full-Stack MERN',
        github: 'https://github.com/Mysterious-Magici/User-Enquiry-Form',
        live: 'https://www.linkedin.com/safety/go/?url=https%3A%2F%2Flnkd.in%2FdGcmXGRs&urlhash=Tj7s&mt=sBRJytz3fpY5cUbKxtYkfWOEyPLtSLh7kGO_zLPrklOKM6fH_PDtFgS1AFAt5gK6P5UNy5CUhqIHfVjL2hynoxWAaZmzmog5KgrduVr0mLv91ga_nnWaJPFFLOk&isSdui=true&lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_creator_profile_all_content_view%3BUFW8QHMfRgi1b7j2VKNmYQ%3D%3D'
    },
    {
        title: 'Bank Customer Churn Analysis',
        category: 'AI & ML',
        stack: 'Python • Scikit-Learn • XGBoost • Pandas • NumPy',
        description:
            'End-to-end customer churn intelligence system utilizing machine learning classification and feature engineering to identify high-risk banking clients and improve retention.',
        badge: 'Predictive ML',
        github: 'https://github.com/Mysterious-Magici/bank-customer-churn-intelligence-system',
        live: 'https://github.com/Mysterious-Magici/bank-customer-churn-intelligence-system'
    },
    {
        title: 'Apnar Swasthya',
        category: 'AI & ML',
        stack: 'XGBoost • FastAPI • Python • Streamlit',
        description:
            'Healthcare data analytics and clinical triage application using gradient-boosted trees for rapid patient risk stratification.',
        badge: 'Healthcare ML',
        github: 'https://github.com/Mysterious-Magici/Mysterious-Magici-apnar-swasthya-clinical-triage',
        live: 'https://apnar-swasthya-app.streamlit.app/'
    },
    {
        title: 'A11yWeaver',
        category: 'Mobile & Data',
        stack: 'Kotlin • Jetpack Compose • Room Database • Android',
        description:
            'Offline-first Android mobile accessibility auditing toolkit engineered to inspect UI hierarchy contrast and screen-reader compliance.',
        badge: 'Android / Kotlin',
        github: 'https://lnkd.in/p/dk3xrDEh',
        live: 'https://www.linkedin.com/safety/go/?url=https%3A%2F%2Flnkd.in%2Fdzum9z2g&urlhash=mQLX&mt=iVehSKgpEI86wxTOtgqIcjzY7vpP_E-0bv49c8unDWcpywtDZg49zBkB7xqP6pbeiw530hmGwRGLWiMyhRj98gbxRfBIAI1nf3WHjjW1hDJjiC_B1j7zpCTq938&isSdui=true&lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_creator_profile_all_content_view%3Be5mh98%2FjS5urtvdR8cdADg%3D%3D'
    },
    {
        title: 'Medical Cost Prediction',
        category: 'AI & ML',
        stack: 'Python • Scikit-Learn • Pandas • NumPy • Regression ML',
        description:
            'Predictive healthcare analytics model engineered to estimate individual medical insurance charges based on demographic, lifestyle, and clinical risk factors.',
        badge: 'Regression ML',
        github: 'https://github.com/Mysterious-Magici/Medical-Cost-Prediction',
        live: 'https://github.com/Mysterious-Magici/Medical-Cost-Prediction'
    },
    {
        title: 'Prospective Customer Segmentation',
        category: 'Mobile & Data',
        stack: 'Python • Scikit-Learn • Pandas • SciPy • Data Analytics',
        description:
            'Unsupervised machine learning clustering and data analytics pipeline designed to segment prospective customers into actionable target personas for precision marketing.',
        badge: 'Data Analytics',
        github: 'https://github.com/Mysterious-Magici/prospective-customer-segmentation',
        live: 'https://github.com/Mysterious-Magici/prospective-customer-segmentation'
    }
];

const SKILL_GROUPS = [
    {
        category: 'Full-Stack Web & Backend',
        icon: Layers,
        skills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Python', 'JavaScript', 'HTML', 'Tailwind CSS', 'AWS (EC2, S3)']
    },
    {
        category: 'AI, Machine Learning & Agents',
        icon: Cpu,
        skills: ['Groq / Gemini / Claude APIs', 'LangGraph', 'XGBoost', 'CatBoost', 'LightGBM', 'Scikit-Learn', 'Prompt Engineering', 'LLM & API Integration', 'Keras', 'TensorFlow', 'PyTorch']
    },
    {
        category: 'Data Analytics & Core CS',
        icon: BarChart3,
        skills: ['Python', 'SQL (PostgreSQL, MySQL)', 'Power BI', 'Tableau', 'Excel', 'Power', 'Pandas & NumPy', 'Java', 'C', 'Git & GitHub', 'Neon Serverless Cloud Hosting', 'Matplotlib', 'Seaborn']
    }
];

export default function ProjectsAndSkills() {
    const [activeTab, setActiveTab] = useState('All');
    const categories = ['All', 'MERN Stack', 'AI & ML', 'Mobile & Data'];

    const filteredProjects =
        activeTab === 'All' ? PROJECTS : PROJECTS.filter((p) => p.category === activeTab);

    return (
        <section id="projects" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                            Engineering Portfolio
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-1">
                            Featured Works & GitHub Repositories
                        </h2>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${activeTab === cat
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {filteredProjects.map((proj, idx) => (
                        <div
                            key={idx}
                            className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-400 hover:bg-white hover:shadow-xl transition duration-200 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                        {proj.badge}
                                    </span>
                                    <Code className="w-4 h-4 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{proj.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">{proj.description}</p>
                            </div>

                            <div>
                                <p className="text-xs font-mono text-indigo-600 pb-4 mb-4 border-b border-slate-200">
                                    {proj.stack}
                                </p>
                                <div className="flex items-center gap-3">
                                    <a
                                        href={proj.github}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                                    >
                                        <Github className="w-3.5 h-3.5" />
                                        <span>GitHub Code</span>
                                    </a>
                                    <a
                                        href={proj.live}
                                        target={proj.live.startsWith('http') ? '_blank' : '_self'}
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:border-indigo-500 hover:text-indigo-600 transition"
                                    >
                                        <span>Explore</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Skills Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                    {SKILL_GROUPS.map((group, idx) => {
                        const Icon = group.icon;
                        return (
                            <div
                                key={idx}
                                className="p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900">{group.category}</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {group.skills.map((skill, sIdx) => (
                                        <span
                                            key={sIdx}
                                            className="px-3 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}