"""Utilidad de desarrollo: genera hashes bcrypt para usar en base/inserts.sql.

No lo importa la aplicación — se ejecuta manualmente cuando se necesite
regenerar los hashes de las contraseñas de prueba sembradas en la base
de datos (por ejemplo, si se agrega un nuevo usuario semilla).

Uso:
    python be/scripts/hash_seed_passwords.py
"""

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PLAIN_PASSWORDS = ["123", "empresa123"]

if __name__ == "__main__":
    for plain in PLAIN_PASSWORDS:
        print(f"{plain} -> {pwd_context.hash(plain)}")
