FROM node:16-slim AS build
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build-app

FROM nginx:1.22.0
COPY --from=build /app/app/dist /usr/share/nginx/html
