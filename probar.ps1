# Servidor local para probar game/index.html sin instalar nada (Windows PowerShell).
# Equivale al mini servidor de la app de Windows: sirve la carpeta game/ en http://localhost:8080
# Las imagenes que se bajan al compilar no estaran (salen sin icono), pero el juego y el mod menu funcionan.
param([int]$Port = 8080)

$root = Join-Path $PSScriptRoot "game"
$mime = @{
  ".html"="text/html; charset=utf-8"; ".js"="text/javascript; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".json"="application/json"; ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".webp"="image/webp";
  ".svg"="image/svg+xml"; ".gif"="image/gif"; ".ico"="image/x-icon"; ".woff2"="font/woff2"; ".woff"="font/woff"; ".ttf"="font/ttf"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try { $listener.Start() } catch { Write-Host "No se pudo abrir el puerto $Port (esta en uso?). Prueba: .\probar.ps1 -Port 8081"; exit 1 }

Write-Host "F1 Glory en http://localhost:$Port/   (Ctrl+C para parar)"
Start-Process "http://localhost:$Port/"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $res = $ctx.Response
    try {
      $p = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
      if ($p.StartsWith("/api/") -or $p.StartsWith("/_vercel/")) {   # el ranking online no existe en tu copia
        $res.StatusCode = 404; $b = [Text.Encoding]::UTF8.GetBytes('{"ok":false}'); $res.ContentType = "application/json"
        $res.OutputStream.Write($b, 0, $b.Length); continue
      }
      if ($p -eq "/") { $p = "/index.html" }
      $file = [IO.Path]::GetFullPath((Join-Path $root $p.TrimStart("/")))
      if (-not $file.StartsWith($root) -or -not (Test-Path $file -PathType Leaf)) { $res.StatusCode = 404; continue }
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
      $res.Headers.Add("Cache-Control", "no-store")
      $bytes = [IO.File]::ReadAllBytes($file)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch { } finally { $res.Close() }
  }
} finally { $listener.Stop() }
