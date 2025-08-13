FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm i --omit=dev
CMD ["node","server.js"]
