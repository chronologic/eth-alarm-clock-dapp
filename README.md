[<img src="https://s3.amazonaws.com/chronologic.network/ChronoLogic_logo.svg" width="128px">](https://github.com/chronologic)

_Note: This DApp is operational on the Kovan and Ropsten testnets. Mainnet release coming soon._ 

# Ethereum Alarm Clock DApp

[![Build Status](https://travis-ci.org/chronologic/eth-alarm-clock-dapp.svg?branch=master)](https://travis-ci.org/chronologic/eth-alarm-clock-dapp)
[![Greenkeeper badge](https://badges.greenkeeper.io/chronologic/eth-alarm-clock-dapp.svg)](https://greenkeeper.io/)

__Homepage:__ [Ethereum Alarm Clock](http://www.ethereum-alarm-clock.com/)

__Looking for the latest install?__: [Latest Releases](https://github.com/chronologic/eth-alarm-clock-dapp/releases)

__Want to run a TimeNode?__: [Guide](https://blog.chronologic.network/how-to-prove-day-ownership-to-be-a-timenode-3dc1333c74ef)

__Smart Contracts__: [Source](https://github.com/ethereum-alarm-clock/ethereum-alarm-clock)

## Development guide

### How to build and run locally
0. Install NPM if not present on the system
1. Clone the repo
2. `npm install` - Install all NodeJS dependencies
3. `npm run dev` - Run the dev server
4. Open `localhost:8080` in your web browser
5. Make sure your MetaMask network is set to either Kovan to start using the DApp.

### Docker
Useful in case a developer would like to test a feature in an isolated environment.
1. Build containers - `npm run docker-build`
2. Wait for the containers to finish building and starting.
3. Visit `localhost:8080` on your browser. If it still not running, check logs with `docker logs ethalarmclockdapp_dapp_1`.
4. Once the DApp is running, point your MetaMask provider to `http://localhost:9545` and import an account with the following private key: `c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3` (default Ganache account).
5. (Optional) To run a TimeNode - select _Custom..._ from the network chooser in the page header and set `http://localhost:9545` as the provider URL.
6. You are now running a fully dockerized environment!
7. _(Optional)_ If you need test DAY tokens, you can get some from the faucet.

### Debugging
Having issues with the project? Try these:
- Try cleaning the project `npm run clean` then running `npm run dev`
- Docker
    - Status of the containers using `docker ps -a`
    - Logs of a specific container `docker logs <container_name>`
    - If all else fails, rebuild the Docker containers using `npm run docker-rebuild`

## Contributing

Pull requests are always welcome. If you found any issues while using our DAapp, please report using the `Issues` tab on Github.

## Questions or Concerns?

Since this is beta software, we highly encourage you to test it, use it and try to break it. We would love your feedback if you get stuck somewhere or you think something is not working the way it should be. Please open an issue if you need to report a bug or would like to leave a suggestion. Pull requests are welcome.
