# Native PowerShell HTTP Server for Matrimonial Site
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "========================================="
Write-Host " Nabhik Matrimonial Local Server"
Write-Host " Listening on http://localhost:$port/"
Write-Host " Press Ctrl+C to stop the server"
Write-Host "========================================="

$basePath = "d:\All Projects\NM"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Clean query strings and hash parameters from request URL
        $urlPath = $request.RawUrl.Split('?')[0]
        if ($urlPath -eq "/" -or [string]::IsNullOrEmpty($urlPath)) { 
            $urlPath = "/index.html" 
        }
        
        # Sanitize path to prevent directory traversal
        $sanitizedPath = $urlPath.Replace('/', '\').TrimStart('\')
        $filePath = Join-Path $basePath $sanitizedPath
        
        # Ensure path remains within the base workspace directory
        if (-not $filePath.StartsWith($basePath, [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403
            $response.Close()
            continue
        }

        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Simple Content-Type mapper
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = "text/plain"
            switch ($ext) {
                ".html" { $contentType = "text/html" }
                ".css"  { $contentType = "text/css" }
                ".js"   { $contentType = "application/javascript" }
                ".png"  { $contentType = "image/png" }
                ".jpg"  { $contentType = "image/jpeg" }
                ".jpeg" { $contentType = "image/jpeg" }
                ".svg"  { $contentType = "image/svg+xml" }
            }
            
            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            # File Not Found
            $response.StatusCode = 404
            $buf = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.ContentLength64 = $buf.Length
            $response.OutputStream.Write($buf, 0, $buf.Length)
        }
        $response.Close()
    }
} catch {
    Write-Host "Server stopped or encountered an error: $_"
} finally {
    $listener.Stop()
    $listener.Close()
}
