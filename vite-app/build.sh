echo "Building the vite app"

npm run build ## --prefix "vite-app"

path_to_docs="../docs"
path_to_dist="./dist"

if test -d $path_to_docs; then
    rm -rf $path_to_docs
    echo "Deleted old \"doc\" folder"
fi

mv $path_to_dist $path_to_docs
echo "Moved vite dist to top level and renamed to \"docs\""