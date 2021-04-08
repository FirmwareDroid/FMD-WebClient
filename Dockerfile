FROM node:14.5 as firmwaredroid-frontend

# Build frontend
RUN mkdir -p /usr/src/app/build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN ls /usr/src/app

RUN yarn
RUN yarn build
