import { motion } from 'framer-motion';

export default function AnimatedLogo({ size = "text-5xl" }) {
    // Configuración de la onda (cada letra)
    const waveVariant = {
        hidden: { y: 0 },
        visible: (i) => ({
            y: [0, -15, 0], // Sube y baja
            transition: {
                delay: i * 0.1, // Retraso en cascada
                duration: 0.6,
                repeat: Infinity, // Repetir infinito
                repeatDelay: 3,   // Esperar 3 seg entre olas
                ease: "easeInOut"
            }
        })
    };

    // Configuración del Pin (caída)
    const pinVariant = {
        hidden: { y: -50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 10,
                delay: 1.5 // Cae después de la primera ola
            }
        }
    };

    const text = "YoViajo";

    return (
        <div className={`font-black tracking-wide flex items-end ${size}`}>
            {/* Texto YoViajo con Ola */}
            <div className="flex">
                {text.split("").map((char, index) => (
                    <motion.span
                        key={index}
                        custom={index}
                        variants={waveVariant}
                        initial="hidden"
                        animate="visible"
                        className={`inline-block origin-bottom ${index < 2 ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500" : // Yo
                                "text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500" // Viajo
                            }`}
                    >
                        {char}
                    </motion.span>
                ))}
            </div>

            {/* Pin Rojo reemplazando al signo de admiración */}
            <motion.div
                variants={pinVariant}
                initial="hidden"
                animate="visible"
                className="ml-1 mb-1 text-red-500"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-[0.8em] h-[0.8em]" // Escala relativo al texto
                >
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
            </motion.div>
        </div>
    );
}
