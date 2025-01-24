#!/bin/bash

directories=(
    "/home/mark/apps/deltadelta.dev"
    "/home/mark/apps/ffmpeg.deltadelta.dev"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "Processing directory: $dir"
        cd "$dir" || continue
        git pull
        npm install
        npm run build
        cd - || continue
    else
        echo "Directory $dir does not exist."
    fi
done

