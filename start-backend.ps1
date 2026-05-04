$ErrorActionPreference = "Stop"

$node = Join-Path $PSScriptRoot "tools\node-v20.12.2-win-x64\node.exe"
$backend = Join-Path $PSScriptRoot "backend"

if (-not (Test-Path $node)) {
  throw "Portable Node was not found at $node"
}

Set-Location $backend
& $node "src\server.js"
