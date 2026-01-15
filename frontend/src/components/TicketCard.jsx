import React from 'react'
import CountdownTimer from './CountdownTimer'

const TicketCard = ({ data, isDriver, isRequest, type, onReserve, onManage, onReport, onMatch, user, authFetch, API_URL }) => {
  const isOffer = type === 'ride' || isDriver // Legacy fallback
  const isBooking = type === 'booking'
  const viewerIsDriver = user?.role === 'C'

  const borderClass = isOffer ? 'border-cyan-500 shadow-cyan-500/10' : 'border-pink-500 shadow-pink-500/10'
  const btnClass = isOffer ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-pink-600 hover:bg-pink-500'

  // Formateo inteligente de Fecha y Hora
  const formatDateTime = () => {
    if (isOffer) {
      // Para Oferta: Mostrar fecha y hora de salida
      if (!data.departure_time) return { date: data.date || 'Pendiente', time: '' }
      const dt = new Date(data.departure_time)
      return {
        date: dt.toLocaleDateString(),
        time: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    } else {
      // Para Solicitud: Mostrar fecha y rango horario
      return {
        date: data.date || 'Pendiente',
        time: (data.time_window_start && data.time_window_end)
          ? `${data.time_window_start.slice(0, 5)} - ${data.time_window_end.slice(0, 5)}`
          : ''
      }
    }
  }

  const { date: displayDate, time: displayTime } = formatDateTime()

  // Función para abrir Maps
  const openMaps = (e) => {
    e.stopPropagation()
    if (data.maps_url) {
      window.open(data.maps_url, '_blank', 'noopener,noreferrer')
    } else {
      const origin = encodeURIComponent(data.origin)
      const destination = encodeURIComponent(data.destination)
      const fallbackUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // Función para manejar clic en reservar
  const handleReserveClick = () => {
    if (!user) {
      alert('⚠️ Debes iniciar sesión para reservar')
      return
    }
    if (onReserve) onReserve(data)
  }

  // Lógica de Botón de Acción
  // Si soy Conductor y veo Solicitud -> "Hacer Match"
  // Si soy Conductor y veo Oferta (Mía) -> "Gestionar"
  // Si soy Pasajero y veo Oferta -> "Reservar"
  // Si soy Pasajero y veo Solicitud (Mía) -> "Pendiente"

  const getActionButtonParams = () => {
    if (viewerIsDriver) {
      if (isRequest) return { label: '⚡ Hacer Match', action: () => onMatch && onMatch(data), disabled: false }
      return { label: 'Gestionar', action: () => onManage && onManage(data), disabled: false }
    } else {
      // Pasajero (o no logueado)
      if (isBooking) {
        // Lógica para Mis Reservas
        // 1. Verificar si el viaje ya pasó -> Opción de Reportar
        // 2. Si es futuro -> opción de Cancelar
        // data.ride_departure_time o data.ride.departure_time? El endpoint devuelve flattened?
        // En MyTrips/backend: booking_dict has 'ride_departure_time'.
        const depTime = data.ride_departure_time || data.departure_time
        const isPast = new Date(depTime) < new Date()

        if (isPast) {
          return { label: '🚨 Reportar Ausencia', action: () => onReport && onReport(data), disabled: false, className: 'bg-orange-600 hover:bg-orange-500' }
        } else {
          return { label: 'Cancelar', action: () => onManage && onManage(data), disabled: false, className: 'bg-red-600 hover:bg-red-500' }
        }
      }

      if (isOffer) return { label: user ? 'Reservar' : 'Inicia sesión', action: handleReserveClick, disabled: !user }
      // Solicitud vista por pasajero
      // Si es MI solicitud -> Gestionar
      if (isRequest && user && data.passenger_name === user.username) {
        return { label: 'Gestionar', action: () => onManage && onManage(data), disabled: false }
      }
      return { label: 'Pendiente', action: null, disabled: true }
    }
  }

  const { label: btnLabel, action: btnAction, disabled: btnDisabled, className: customBtnClass } = getActionButtonParams()
  const finalBtnClass = customBtnClass || btnClass

  return (
    <div className={`relative mb-4 p-5 rounded-2xl bg-slate-900 border-l-4 shadow-lg transition-transform hover:translate-x-1 duration-300 ${borderClass}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-white text-lg flex items-center gap-2">
            {data.origin}
            <span className="text-slate-600 text-sm">➜</span>
            {data.destination}
          </h4>
          <div className="mt-1 inline-flex items-center gap-2 bg-slate-950/50 px-2 py-1 rounded border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">📅 {displayDate}</span>
          </div>
          {displayTime && (
            <div className="mt-1 ml-2 inline-flex items-center gap-2 bg-slate-950/50 px-2 py-1 rounded border border-slate-800">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">⏰ {displayTime}</span>
            </div>
          )}
          {data.departure_time && (
            <div className="mt-2">
              <CountdownTimer targetDate={data.departure_time} />
            </div>
          )}
          {/* DRIVER INTEREST INDICATOR */}
          {viewerIsDriver && isOffer && data.bookings_count !== undefined && ( // Show even if 0? Or only if > 0? User asked for Red Dot/Counter
            <div className="mt-2 flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-700">
              <div className={`w-2 h-2 rounded-full ${data.bookings_count > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></div>
              <span className="text-[10px] font-bold text-slate-300 uppercase">{data.bookings_count} Reservas</span>
            </div>
          )}
        </div>
        <div className="text-right ml-4">
          {data.price && <span className="text-2xl font-black text-white tracking-tighter">${data.price}</span>}
          <div className="mt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase">{data.available_seats} Asientos</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-3 mt-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{isOffer ? '🚗' : '🙋‍♂️'}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {isOffer ? data.driver_name || `Cond. #${data.driver_id}` : data.passenger_name || `Pas. #${data.passenger_id}`}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openMaps}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-3 rounded-lg text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1"
            title="Abrir ruta en Google Maps"
          >
            <span>🗺️</span>
            <span>Ver Ruta</span>
          </button>
          <button
            onClick={btnAction}
            className={`flex-1 px-4 py-2 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95 ${finalBtnClass} ${btnDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={btnDisabled}
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketCard
