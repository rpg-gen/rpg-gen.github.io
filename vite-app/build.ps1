Write-Output "Building the vite app"

npm run build ## --prefix "vite-app"

$path_to_docs = "../docs"
$path_to_dist = "./dist"

if (Test-Path $path_to_docs) {
    Remove-Item $path_to_docs -Recurse -Force
    Write-Output "Deleted old `"docs`" folder"
}

Move-Item $path_to_dist $path_to_docs
Write-Output "Moved vite dist to top level and renamed to `"docs`""