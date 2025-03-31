# Скрипт для резервного копирования проекта перед заменой терминологии
# Создает ZIP-файл со всем проектом в директории backups/

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupName = "ofs_project_backup_$timestamp"
$backupDir = "backups"
$backupPath = "$backupDir\$backupName.zip"

# Создаем директорию для резервных копий, если ее нет
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
    Write-Host "Создана директория $backupDir"
}

# Список директорий и файлов, которые нужно исключить из бэкапа
$excludedDirs = @(
    "*\node_modules\*", 
    "*\.git\*", 
    "*\venv\*", 
    "*\.venv\*", 
    "*\__pycache__\*",
    "*\backups\*",
    "*\dist\*",
    "*\build\*"
)

Write-Host "Создаем резервную копию проекта..." -ForegroundColor Cyan

# Создаем временную директорию для подготовки файлов
$tempDir = "$backupDir\temp_$timestamp"
New-Item -ItemType Directory -Path $tempDir

try {
    # Копируем файлы проекта во временную директорию, исключая указанные
    $excludeParams = $excludedDirs | ForEach-Object { "--exclude=$_" }
    
    Write-Host "Копирование файлов проекта..."
    
    # Копируем все, кроме исключенных директорий
    Get-ChildItem -Path "." -Recurse -File | 
        Where-Object {
            $path = $_.FullName
            $excluded = $false
            foreach ($pattern in $excludedDirs) {
                if ($path -like $pattern) {
                    $excluded = $true
                    break
                }
            }
            -not $excluded
        } | 
        ForEach-Object {
            $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 1)
            $destination = Join-Path $tempDir $relativePath
            $destinationDir = Split-Path $destination -Parent
            
            if (-not (Test-Path $destinationDir)) {
                New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
            }
            
            Copy-Item $_.FullName -Destination $destination -Force
        }
    
    # Создаем ZIP архив
    Write-Host "Создание ZIP архива..."
    Compress-Archive -Path "$tempDir\*" -DestinationPath $backupPath -CompressionLevel Optimal -Force
    
    Write-Host "Резервная копия успешно создана: $backupPath" -ForegroundColor Green
}
catch {
    Write-Host "Ошибка при создании резервной копии: $_" -ForegroundColor Red
}
finally {
    # Удаляем временную директорию
    if (Test-Path $tempDir) {
        Remove-Item -Path $tempDir -Recurse -Force
    }
} 