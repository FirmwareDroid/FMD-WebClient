# syntax=docker/dockerfile:experimental
FROM node:22-slim AS builder

# Build frontend
RUN mkdir -p /usr/src/app/build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN yarn install --frozen-lockfile && yarn build

FROM alpine:3.20 AS firmwaredroid-frontend
RUN addgroup -S -g 1000 node && adduser -S -u 1000 -G node node
COPY --from=builder --chown=node:node /usr/src/app/build /usr/src/app/build
USER node
