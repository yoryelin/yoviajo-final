"""
Rutas de Solicitudes (Demandas de pasajeros).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.ride import RideRequest, Ride
from app.schemas.request import RequestCreate, RequestResponse
from app.api.deps import get_current_user
from app import utils

router = APIRouter(prefix="/api/requests", tags=["requests"])


@router.get("/me", response_model=List[RequestResponse])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtener mis solicitudes de viaje.
    """
    requests = db.query(RideRequest).filter(RideRequest.passenger_id == current_user.id).all()
    result = []
    for req in requests:
        req_dict = RequestResponse.from_orm(req).dict()
        req_dict['maps_url'] = utils.generate_google_maps_url(
            req.origin,
            req.destination,
            req.origin_lat,
            req.origin_lng,
            req.destination_lat,
            req.destination_lng
        )
        
        # Calcular coincidencias (Ofertas activas con mismo Origen/Destino)
        matches = db.query(Ride).filter(
            Ride.origin == req.origin, 
            Ride.destination == req.destination,
            Ride.status == "active"
        ).count()
        req_dict['matches_count'] = matches
        
        result.append(req_dict)
    return result


@router.get("", response_model=List[RequestResponse])
def get_requests(db: Session = Depends(get_db)):
    """
    Obtener todas las solicitudes de viajes.
    """
    requests = db.query(RideRequest).all()
    result = []
    # ... code continues...

@router.post("", response_model=RequestResponse)
def create_request(
    request: RequestCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear una nueva solicitud. Requiere autenticación.
    """
    request_data = request.dict()
    
    # Validar ventana de tiempo (72 horas)
    from datetime import datetime, timedelta
    try:
        # Asumimos que request.date es YYYY-MM-DD
        req_date = datetime.strptime(request.date, '%Y-%m-%d')
        now = datetime.now()
        
        if req_date.date() < now.date():
             # Permitir mismo día, pero no ayer
             raise HTTPException(status_code=400, detail="La fecha no puede ser en el pasado")
             
        if req_date > now + timedelta(hours=72):
            raise HTTPException(status_code=400, detail="Solo se pueden solicitar viajes dentro de las próximas 72 horas")
            
    except ValueError:
        pass # Si el formato falla, lo dejamos pasar o manejamos error (pydantic valida formato fecha usualmente)

    new_req = RideRequest(**request_data, passenger_id=current_user.id)
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    
    # Agregar enlace de Maps a la respuesta
    result = RequestResponse.from_orm(new_req).dict()
    result['maps_url'] = utils.generate_google_maps_url(
        new_req.origin,
        new_req.destination,
        new_req.origin_lat,
        new_req.origin_lng,
        new_req.destination_lat,
        new_req.destination_lng
    )
    result['matches_count'] = 0 # Recién creada, asumimos 0 o podríamos buscar
    return result

@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cancelar (eliminar) una solicitud.
    Solo el pasajero creador puede eliminarla.
    """
    request = db.query(RideRequest).filter(RideRequest.id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Solicitud no encontrada"
        )
    
    if request.passenger_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar esta solicitud"
        )
    
    db.delete(request)
    db.commit()
    return None
