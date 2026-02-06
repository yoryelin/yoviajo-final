import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function VerificationNagModal({ isOpen, onClose, onVerify }) {
    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Decorative Header */}
                <div className="h-2 bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500"></div>

                <div className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto border border-slate-700 shadow-xl shadow-cyan-900/20">
                        <span className="text-3xl">🛡️</span>
                    </div>

                    <div>
                        <h2 className="text-2xl font-black text-white mb-2">Comunidad Segura</h2>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            "Nuestra comunidad de viajes se basa en la confianza de todos los usuarios, por lo cual es necesario verificar tu identidad mediante una foto de frente de tu DNI."
                        </p>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-500/20 p-4 rounded-xl">
                        <p className="text-xs text-yellow-200/80 font-medium">
                            🔒 Tus datos están protegidos y solo se usan para validar que eres una persona real.
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <button
                            onClick={onVerify}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-900/20 transition transform active:scale-95 uppercase tracking-widest text-xs"
                        >
                            📸 Verificar mi Identidad Ahora
                        </button>

                        <button
                            onClick={onClose}
                            className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-wider transition underline decoration-transparent hover:decoration-white"
                        >
                            Lo haré más tarde
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
