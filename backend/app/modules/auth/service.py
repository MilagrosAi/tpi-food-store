from datetime import timedelta
from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.schemas import UserCreate, UserPublic
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioDuplicado(Exception):
    pass


class CredencialesInvalidas(Exception):
    pass


class CuentaDesactivada(Exception):
    pass


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def register(self, data: UserCreate) -> UserPublic:
        username = data.username.strip()
        full_name = data.full_name.strip()
        email = data.email.lower().strip()

        with self.uow as uow:
            if uow.usuarios.get_by_username(username):
                raise UsuarioDuplicado("El nombre de usuario ya está registrado")
            if uow.usuarios.get_by_email(email):
                raise UsuarioDuplicado("El email ya está registrado")

            nuevo_usuario = Usuario(
                username=username,
                full_name=full_name,
                email=email,
                hashed_password=hash_password(data.password),
                role="user",
                disabled=False,
            )
            creado = uow.usuarios.add(nuevo_usuario)
            return UserPublic.model_validate(creado)

    def authenticate_and_create_token(self, username: str, password: str) -> str:
        clean_username = username.strip()

        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(clean_username)
            if not usuario or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas("Usuario o contraseña incorrectos")

            if usuario.disabled:
                raise CuentaDesactivada("Cuenta de usuario desactivada")

            expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            return create_access_token(
                data={"sub": usuario.username, "role": usuario.role},
                expires_delta=expires_delta,
            )