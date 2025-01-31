FROM node:22 AS frontend-builder

WORKDIR /app

COPY frontend/package.json frontend/yarn.lock ./ 
RUN yarn install

COPY frontend . 

ENV NEXT_PUBLIC_BACKEND_URI=http://localhost:80
ENV NEXT_PUBLIC_USE_OLLAMA=false

RUN yarn build

FROM nginx:stable

# software
RUN apt-get update && apt-get install -y curl build-essential git python3-pip python3-venv \
    && curl -sL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

RUN rm -rf /usr/share/nginx/html/*

COPY --from=frontend-builder /app/out /usr/share/nginx/html

RUN chmod -R 755 /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf


WORKDIR /app

COPY backend/package.json backend/yarn.lock ./
RUN npm install

COPY backend .
RUN npm run build

EXPOSE 80

CMD ["bash", "-c", "nginx -g 'daemon off;' & npm run start"]
