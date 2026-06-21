# Script de backup de la base de datos PowerPOS
$fecha = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$archivo = "backups\powerpos_backup_$fecha.sql"

Write-Host "Generando backup en $archivo..."

docker exec powerpos_db pg_dump -U powerpos -d powerpos_dev > $archivo

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backup creado exitosamente: $archivo" -ForegroundColor Green
} else {
    Write-Host "Error al crear el backup" -ForegroundColor Red
}