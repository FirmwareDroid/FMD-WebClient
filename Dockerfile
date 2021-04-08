# Create react build
FROM firmwaredroid-frontend-base as firmwaredroid-frontend
COPY . /usr/src/app
RUN yarn build

#Deploy build to server
COPY ./build /usr/src/app/build