import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '@config/api';

export default function Experiences() {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExperiences();
    }, []);

    const fetchExperiences = async () => {
        try {
            const res = await fetch(`${API_URL}/public/experiences`);
            if (res.ok) {
                const data = await res.json();
                setExperiences(data);
            }
        } catch (error) {
            console.error("Error fetching experiences:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || experiences.length === 0) {
        return null; // No mostrar nada si no hay experiencias o está cargando
    }

    return (
        <section className="w-full bg-slate-900 py-20 relative z-10 text-white mt-12 md:mt-24 border-t-4 border-cyan-500">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Experiencias Reales</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Miles de kilómetros compartidos. Conoce lo que dicen los miembros de nuestra comunidad sobre viajar con YoViajo.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {experiences.map((exp, index) => (
                        <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl relative"
                        >
                            <div className="text-4xl absolute -top-4 -left-2 opacity-20">❝</div>
                            <div className="flex text-yellow-400 mb-4">
                                {[...Array(exp.rating)].map((_, i) => (
                                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-slate-300 italic mb-6">"{exp.comment}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center font-bold">
                                    {exp.reviewer_name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold">{exp.reviewer_name}</p>
                                    <p className="text-xs text-slate-500">Miembro verificado</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
