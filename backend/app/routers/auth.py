from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from ..database import get_db
from .. import schemas, models
from ..security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(payload: schemas.RegisterIn, db: Session = Depends(get_db)):
    exists = db.query(models.Restaurant).filter(models.Restaurant.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.Restaurant(
        email=payload.email,
        name=payload.name,
        password_hash=hash_password(payload.password),
        city=payload.city,
        address=payload.address,
        lat=payload.lat,
        lng=payload.lng,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(subject=user.email)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.Restaurant).filter(models.Restaurant.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password")
    token = create_access_token(subject=user.email)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.MeOut)
def me(db: Session = Depends(get_db), token: dict = Depends(login)):
    # NOTE: Using OAuth2PasswordBearer flow; handled in deps.get_current_restaurant in real routes
    # Here we return 401 to encourage using Authorization: Bearer <token> on routes that need it.
    raise HTTPException(status_code=401, detail="Use Authorization: Bearer <token> on protected routes.")

@router.post("/logout")
def logout():
    # JWT stateless; фронту достаточно забыть токен
    return {"ok": True}
