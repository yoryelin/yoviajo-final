"""
Script para verificar que la estructura consolidada está correcta.
"""
import os
import sys

print("🔍 Verificando estructura del proyecto...\n")

errors = []
warnings = []

# Verificar que los archivos nuevos existen
required_files = [
    "app/main.py",
    "app/config.py",
    "app/database.py",
    "app/auth.py",
    "app/utils.py",
    "app/models/__init__.py",
    "app/models/user.py",
    "app/models/ride.py",
    "app/schemas/__init__.py",
    "app/schemas/user.py",
    "app/schemas/ride.py",
    "app/schemas/request.py",
    "app/api/deps.py",
    "app/api/routes/auth.py",
    "app/api/routes/rides.py",
    "app/api/routes/requests.py",
    "app/api/routes/geocode.py",
    "run.py",
    "requirements.txt",
]

print("✓ Verificando archivos requeridos...")
for file in required_files:
    if os.path.exists(file):
        print(f"  ✓ {file}")
    else:
        errors.append(f"❌ Falta: {file}")

# Verificar que los archivos obsoletos NO existen
obsolete_files = [
    "main.py",  # Debe estar en app/
    "models.py",
    "schemas.py",
    "auth.py",
    "database.py",
    "utils.py",
]

print("\n✓ Verificando que archivos obsoletos no existen...")
for file in obsolete_files:
    if os.path.exists(file):
        warnings.append(f"⚠️  Archivo obsoleto encontrado (puede eliminarse): {file}")
    else:
        print(f"  ✓ {file} no existe (correcto)")

# Verificar estructura Django
django_dirs = ["core", "rides", "users"]
print("\n✓ Verificando estructura Django...")
for dir_name in django_dirs:
    if os.path.exists(dir_name):
        warnings.append(f"⚠️  Directorio Django encontrado (puede eliminarse): {dir_name}/")
    else:
        print(f"  ✓ {dir_name}/ no existe (correcto)")

# Resumen
print("\n" + "="*50)
if errors:
    print("❌ ERRORES ENCONTRADOS:")
    for error in errors:
        print(f"  {error}")
    sys.exit(1)

if warnings:
    print("⚠️  ADVERTENCIAS:")
    for warning in warnings:
        print(f"  {warning}")
    print("\n  Nota: Las advertencias no impiden el funcionamiento.")

print("✅ Estructura verificada correctamente!")
print("\n📝 Próximos pasos:")
print("  1. Ejecuta: python test_imports.py")
print("  2. Crea .env desde .env.example")
print("  3. Ejecuta: python run.py")


