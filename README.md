# FirmwareDroid Client

FirmwareDroid is an analysis tool for Android firmware. This repository contains the FirmwareDroid frontend implementation with React.

# Contribution

Feel free to contribute and open pull requests.

As a first step, follow the [Getting Started guide](https://firmwaredroid.github.io/posts/getting-started/) to install FirmwareDroid.

If you have successfully set up FirmwareDroid, please stop and remove its containers.

```shell
docker compose down
```

Next, please open directory `/FirmwareDroid` and uncomment the following line in file `docker-compose.yml`.

```shell
cd FirmwareDroid
```

```dockerfile
- ./firmware-droid-client/build:/usr/share/nginx/html # Dev-Route
```

Optionally, fork repository <https://github.com/FirmwareDroid/FMD-WebClient>, delete directory `/firmware-droid-client` and clone your forked repository. Note that the web frontend directory needs to be called `firmware-droid-client`.

```shell
rm -rf firmware-droid-client

git clone https://github.com/<username-with-fork>/FMD-WebClient firmware-droid-client
```

Then, open directory `/firmware-droid-client` and install the web frontend's dependencies and build it.

```shell
cd firmware-droid-client

yarn install --frozen-lockfile && yarn build
```

And then switch back to directory `/FirmwareDroid` and create and start the containers again.

```shell
docker compose up
```

At this point, verify that the web frontend is running at <https://fmd.localhost>.

If it is running, you are set to make changes to the frontend's source code in `/firmware-droid-client`. To apply your changes build the project again.

```shell
yarn build
```

## Quality checks

Run the complete frontend verification suite before opening a pull request:

```shell
yarn typecheck
yarn lint
yarn test
yarn build
yarn audit --groups dependencies
```

Yarn Classic and `yarn.lock` are the project's package-management source of truth.

## Deployment security

The web server that serves the generated `build` directory should set a restrictive Content Security Policy,
`X-Content-Type-Options: nosniff`, an appropriate `Referrer-Policy`, and frame-embedding protection. Configure these
headers in the production reverse proxy so they also cover redirects and error responses. Emulator endpoints must use
HTTPS/WSS except for localhost development. Credentials must never be placed in frontend environment variables,
browser storage, query strings, or WebSocket URLs; use same-origin secure cookies or a backend-issued short-lived ticket.

Finally, if you refresh the page you should see your changes.
