# Create react build
FROM firmwaredroid-frontend-base as firmwaredroid-frontend
COPY . /usr/src/app
RUN yarn minify-sass
RUN yarn map-sass
RUN yarn build

#Deploy build to server
COPY ./build /usr/src/app/build