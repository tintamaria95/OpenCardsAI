# RUN THIS FILE AT THE ROOT OF PROJECT
# This file aims to run commands to create the ocg application without the need for a Compose installation
echo "start script"
echo "-- BUILDING PHASE --"

if ! podman images | grep -q "ocg-back"; then
        echo "(localhost/ocg-back:latest not found in podman image repo)"
        echo "1/2 Build: OCG Backend"
        podman build --rm --tag ocg-back ./backend/
else
        echo "1/2 Found ocg-back image in image repo"
fi

if ! podman images | grep -q "ocg-front"; then
        echo "(localhost/ocg-front:latest not found in podman image repo)"
        echo "2/2 Build: OCG Frontend"
        podman build --rm --tag ocg-front ./frontend/
else
        echo "2/2 Found ocg-front image in image repo"
fi

echo "-- RUNNING CONTAINER PHASE --"

echo "Running 1/2: OCG Backend"
if !  podman container ps | grep -q "backend-ocg"; then
        if ! podman container list -a | grep -q "backend-ocg";then
                podman run -d --name backend-ocg --publish 3000:3000 ocg-back:latest
        else
                podman container start backend-ocg
        fi
else
        echo "Container backend-ocg already running"
fi
# Backend container exposed port 3000 to host port 3000.

echo "Running 2/2: OCG Frontend"
if ! podman container ps | grep -q "frontend-ocg"; then
        if ! podman container list -a | grep -q "frontend-ocg";then
                podman run -d --name frontend-ocg --publish 8080:80 --env-file .env -v ./frontend/.nginx:/etc/nginx/conf.d/ ocg-front:latest
        else
                podman container start frontend-ocg
        fi
else
        echo "Container frontend-ocg already running"
fi
# Frontend container exposed port 80 to host port 8080

echo "end script"
