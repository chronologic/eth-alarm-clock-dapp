[<img src="https://s3.amazonaws.com/chronologic.network/ChronoLogic_logo.svg" width="128px">](https://github.com/chronologic)

# Ethereum Alarm Clock DApp

A DApp that interacts with the Ethereum Alarm Clock.

# Development guide

## How to build and run locally
0. Install NPM if not present on the system
1. Clone the repo
2. `npm install` - Install all NodeJS dependencies
3. `npm run dev` - Run the dev server
4. Check `localhost:8080` in your browser

## Docker
Useful in case a developer would like to test a feature in an isolated environment.
1. Build containers - `npm run docker-build`
2. Wait for the containers to finish building and starting.
3. Visit `localhost:8080` on your browser. If it still not running, check logs with `docker logs ethalarmclockdapp_dapp_1`.
4. Once the DApp is running, point your MetaMask provider to `http://localhost:9545` and import an account with the following private key: `c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3` (default Ganache account).
5. You are now running a fully dockerized environment!
6. (Optional) If you need test DAY tokens, you can get some from the faucet.

## Debugging
Having issues with the project? Try these:
- Try cleaning the project `npm run clean` then running `npm run dev`

# Contributing

Pull requests are always welcome. If you found any issues while using our DAapp, please report using `Issues` tab on Github.

# Questions or Concerns?

Since this is beta software, we highly encourage you to test it, use it and try to break it. We would love your feedback if you get stuck somewhere or you think something is not working the way it should be. Please open an issue if you need to report a bug or would like to leave a suggestion. Pull requests are welcome.
