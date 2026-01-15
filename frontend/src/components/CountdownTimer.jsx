import { useState, useEffect } from 'react'

const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState(null)

    useEffect(() => {
        if (!targetDate) return

        const calculateTimeLeft = () => {
            const difference = new Date(targetDate) - new Date()

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                }
            }
            return null // Expired
        }

        // Initial calc
        setTimeLeft(calculateTimeLeft())

        // Update every minute (or second if critical)
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 60000)

        return () => clearInterval(timer)
    }, [targetDate])

    if (!timeLeft) {
        return <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Finalizado</span>
    }

    const { days, hours, minutes } = timeLeft

    // Logic for color/urgency
    let colorClass = "text-emerald-400"
    let icon = "⏱️"

    if (days === 0 && hours < 24) {
        colorClass = "text-yellow-400" // Less than 24h
    }
    if (days === 0 && hours < 2) {
        colorClass = "text-red-400 animate-pulse" // Less than 2h (Critical)
        icon = "⚠️"
    }

    return (
        <div className={`flex items-center gap-1 font-mono text-[10px] md:text-xs font-bold ${colorClass} bg-slate-900/80 px-2 py-1 rounded border border-slate-700/50`}>
            <span>{icon}</span>
            {days > 0 && <span>{days}d</span>}
            <span>{hours}h</span>
            <span>{minutes}m</span>
        </div>
    )
}

export default CountdownTimer
