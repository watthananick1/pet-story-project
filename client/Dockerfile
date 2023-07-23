# Stage 1 - Build the React Application
FROM node:18-alpine as builder
WORKDIR /client
COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY . .
COPY . .
COPY .env .env
RUN npm install
RUN npm install -g cross-env
RUN npm run build

# Stage 2 - Serve the React Application using Nginx
FROM nginx:1.25.1
WORKDIR /usr/share/nginx/html
COPY --from=builder /client/build .
ENTRYPOINT ["nginx", "-g", "daemon off;"]
