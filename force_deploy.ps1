Write-Host "🚀 Iniciando subida manual a GitHub..." -ForegroundColor Green

# 1. Asegurar repositorio
git init

# 2. Agregar todo
git add .

# 3. Commit (si no hay nada nuevo, esto dará error pero seguimos)
git commit -m "Release: Production Ready System"

# 4. Configurar Remoto (Forzamos la URL correcta)
git remote remove origin 2>$null
git remote add origin https://github.com/yoryelin/yoviajo-final.git

# 5. Push
Write-Host "☁️ Subiendo a GitHub... (Si aparece una ventana de Login, por favor complétala)" -ForegroundColor Yellow
git push -u origin main --force

Write-Host "✅ Proceso finalizado. Verifica tu repositorio en el navegador." -ForegroundColor Green
Read-Host -Prompt "Presiona Enter para cerrar"
