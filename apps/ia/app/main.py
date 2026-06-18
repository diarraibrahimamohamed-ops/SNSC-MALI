from fastapi import FastAPI, Request, HTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.routes_health import router as health_router
from app.api.routes_predict import router as predict_router
import uuid
import time
from datetime import datetime
import hashlib
import json

# Rate limiting configuration
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Vaccin Track IA Service")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Audit logging for RGPD Article 22
audit_log = []

@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    # Generate request ID
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Log request start
    start_time = time.time()
    
    response = await call_next(request)
    
    # Log prediction requests for audit
    if request.url.path == "/predict" and request.method == "POST":
        try:
            body = await request.json()
            enfant_id_hash = hashlib.sha256(body.get('enfant_id', '').encode()).hexdigest()[:16]
            
            audit_entry = {
                "request_id": request_id,
                "enfant_id_hash": enfant_id_hash,
                "timestamp": datetime.utcnow().isoformat(),
                "ip": request.client.host if request.client else "unknown",
                "user_agent": request.headers.get("user-agent", "unknown"),
                "endpoint": str(request.url),
                "method": request.method
            }
            
            # Add response data if available
            if response.status_code == 200:
                response_body = json.loads(response.body.decode()) if hasattr(response, 'body') else {}
                audit_entry.update({
                    "score": response_body.get("score"),
                    "niveau_risque": response_body.get("niveau_risque"),
                    "confiance": response_body.get("confiance"),
                    "version_modele": response_body.get("version_modele")
                })
            
            audit_log.append(audit_entry)
            
            # Keep only last 1000 entries in memory (in production, use database)
            if len(audit_log) > 1000:
                audit_log.pop(0)
                
        except Exception as e:
            print(f"Audit logging error: {e}")
    
    return response

@app.get("/audit/logs")
@limiter.limit("60/minute")
async def get_audit_logs(request: Request):
    """Endpoint to retrieve audit logs (protected by rate limiting)"""
    return {
        "total_entries": len(audit_log),
        "logs": audit_log[-100:]  # Return last 100 entries
    }

app.include_router(health_router)
app.include_router(predict_router)
