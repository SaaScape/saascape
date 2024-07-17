FROM node:lts-alpine
LABEL authors="Keir Davie"

WORKDIR /app
RUN mkdir -p /app/client
RUN mkdir -p /app/server

COPY ./client/package*.json ./client
COPY ./server/package*.json ./server
RUN cd ./client && npm ci --omit=dev -f
RUN cd ./server && npm ci --omit=dev -f

#Copy client code
COPY ./client/dist ./client/dist
COPY ./client/public ./client/public

#Copy server code
COPY ./server/dist ./server/dist

ENV NODE_ENV=production
CMD ["npm","start"]