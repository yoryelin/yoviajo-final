import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-28 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-xl z-[9999] flex items-center justify-between animate-in slide-in-from-bottom-5">
            <div className="flex-1 mr-4">
                <h3 className="text-white font-medium text-sm mb-1">Instala YoViajo!</h3>
                <p className="text-slate-400 text-xs">
                    Instala la aplicación en tu dispositivo para un acceso más rápido y mejor experiencia.
                </p>
            </div>
            <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
                <Download size={16} />
                Instalar
            </button>
            <button
                onClick={() => setIsVisible(false)}
                className="absolute -top-2 -right-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-full p-1 border border-slate-600"
                aria-label="Cerrar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
        </div>
    );
}
