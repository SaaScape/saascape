FROM node:lts-alpine
LABEL authors="Keir Davie"

WORKDIR /app
RUN mkdir -p /app/server

COPY ./server/package*.json ./server
RUN cd ./server && npm ci --omit=dev -f

#Copy server code
COPY ./server/dist ./server/dist

ENV NODE_ENV=production
CMD ["npm","start"]