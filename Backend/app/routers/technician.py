from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.models.service import ServiceRequest

router = APIRouter(prefix="/api/technician", tags=["Technician Dashboard"])

# ═══════════════════════════════════════════════════════
# GET ASSIGNED OR PENDING JOBS
# ═══════════════════════════════════════════════════════
@router.get("/jobs")
def get_technician_jobs(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if current_user.role != UserRole.TECHNICIAN:
        raise HTTPException(status_code=403, detail="Not authorized as technician")

    # Show all PENDING jobs and jobs assigned to this specific tech
    query = select(ServiceRequest).where(
        (ServiceRequest.technician_id == current_user.id) | 
        (ServiceRequest.status == "PENDING")
    ).order_by(ServiceRequest.created_at.desc())
    
    jobs = session.exec(query).all()

    formatted_jobs = []
    for job in jobs:
        formatted_jobs.append({
            "id": job.id,
            "title": job.service_name,
            "customer": job.customer_name,
            "price": 500, # Placeholder for now
            "status": job.status,
            "description": job.description,
            "address": job.address,
            "phone": job.phone,
            "preferred_date": str(job.preferred_date) if job.preferred_date else None
        })

    return {"jobs": formatted_jobs}

# ═══════════════════════════════════════════════════════
# UPDATE JOB STATUS (Accept / Start / Complete)
# ═══════════════════════════════════════════════════════
@router.put("/jobs/{job_id}/status")
def update_job_status(
    job_id: int,
    status_data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if current_user.role != UserRole.TECHNICIAN:
        raise HTTPException(status_code=403, detail="Not authorized")

    job = session.get(ServiceRequest, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    new_status = status_data.get("status")
    
    # Assign this tech if accepting a pending job
    if job.status == "PENDING" and new_status in ["IN_PROGRESS", "ACCEPTED"]:
        job.technician_id = current_user.id

    job.status = new_status
    session.add(job)
    session.commit()
    
    return {"success": True, "message": f"Job status updated to {new_status}"}

# ═══════════════════════════════════════════════════════
# GET WALLET SUMMARY (Safe Fallback)
# ═══════════════════════════════════════════════════════
@router.get("/wallet")
def get_technician_wallet(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if current_user.role != UserRole.TECHNICIAN:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Using 0 as a safe fallback so the UI doesn't crash
    return {
        "wallet": {
            "availableBalance": 0,
            "pendingEscrow": 0,
            "jobsCompleted": 0,
            "totalEarnings": 0
        }
    }