import React, { useRef, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Torus, Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import { ArrowRight, Sparkles, Send } from 'lucide-react';
import Github from './Github';

const AnimatedScene = memo(function AnimatedScene() {
    const groupRef = useRef();
    const torusRef = useRef();
    const icoRef = useRef();

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.12;
        }
        if (torusRef.current) {
            torusRef.current.rotation.x += delta * 0.35;
            torusRef.current.rotation.y += delta * 0.25;
        }
        if (icoRef.current) {
            icoRef.current.rotation.z -= delta * 0.3;
            icoRef.current.rotation.x += delta * 0.2;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Left Smooth Orb (Optimized 28x28 segments for 60 FPS) */}
            <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.2}>
                <Sphere args={[1, 28, 28]} position={[-3.2, 0.8, -1]} scale={1.45}>
                    <MeshDistortMaterial
                        color="#6366f1"
                        distort={0.28}
                        speed={1.5}
                        roughness={0.2}
                    />
                </Sphere>
            </Float>

            {/* Right Tech Wireframe Icosahedron */}
            <Float speed={2} rotationIntensity={1} floatIntensity={1.4}>
                <Icosahedron ref={icoRef} args={[1.2, 1]} position={[3.3, 0.5, -0.5]}>
                    <meshStandardMaterial color="#0ea5e9" wireframe transparent opacity={0.45} />
                </Icosahedron>
            </Float>

            {/* Bottom Floating Ring */}
            <Float speed={1.5} rotationIntensity={0.8} floatIntensity={1}>
                <Torus ref={torusRef} args={[0.9, 0.22, 16, 40]} position={[2.4, -1.6, -1.5]}>
                    <meshStandardMaterial color="#8b5cf6" roughness={0.3} transparent opacity={0.65} />
                </Torus>
            </Float>
        </group>
    );
});

export default function Hero() {
    return (
        <section
            id="about"
            className="relative min-h-screen pt-20 pb-12 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/70 overflow-hidden"
        >
            {/* Hardware-Accelerated 60 FPS Three.js Canvas */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-80">
                <Canvas
                    dpr={[1, 1.5]}
                    camera={{ position: [0, 0, 6], fov: 45 }}
                    gl={{ antialias: true, powerPreference: 'high-performance' }}
                >
                    <ambientLight intensity={1.4} />
                    <directionalLight position={[4, 5, 3]} intensity={1.6} />
                    <AnimatedScene />
                </Canvas>
            </div>

            {/* Foreground Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
                {/* Compact, Proportional Profile Avatar (112px - 128px) */}
                <div className="relative mb-5 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
                    <img
                        src="/self-Photo.jpeg"
                        alt="Akash Karmakar"
                        loading="eager"
                        className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl object-cover object-top"
                    />
                    <span
                        className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
                        title="Available for Opportunities"
                    />
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100/90 text-indigo-700 text-xs font-semibold mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Full-Stack MERN Developer • Data & AI Applications</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Hi, I'm{' '}
                    <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                        Akash Karmakar
                    </span>
                </h1>

                <p className="text-base md:text-lg text-slate-600 max-w-2xl mb-8 leading-relaxed">
                    Computer Science Engineer • Full-Stack Systems • Advanced AI Workflows • Predictive Data Analytics
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3.5">
                    <a
                        href="#projects"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition"
                    >
                        <span>View Projects</span>
                        <ArrowRight className="w-4 h-4" />
                    </a>
                    <a
                        href="https://github.com/Mysterious-Magici"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-sm"
                    >
                        <Github className="w-4 h-4" />
                        <span>GitHub Profile</span>
                    </a>
                    <a
                        href="#contact"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-800 text-sm font-semibold border border-slate-200 hover:border-indigo-300 transition shadow-sm"
                    >
                        <Send className="w-4 h-4 text-indigo-600" />
                        <span>Get In Touch</span>
                    </a>
                </div>
            </div>
        </section>
    );
}