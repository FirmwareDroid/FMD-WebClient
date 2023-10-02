# syntax=docker/dockerfile:experimental
FROM node:20.7-slim as firmwaredroid-frontend

# Build frontend
RUN mkdir -p /usr/src/app/build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN yarn && yarn build
