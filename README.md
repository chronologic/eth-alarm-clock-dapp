[<img src="https://s3.amazonaws.com/chronologic.network/ChronoLogic_logo.svg" width="128px">](https://github.com/chronologic)

_Update: This DApp is operational on the Mainnet as well as on the Kovan and Ropsten testnets._ 

# Ethereum Alarm Clock DApp

[![Build Status](https://travis-ci.org/chronologic/eth-alarm-clock-dapp.svg?branch=master)](https://travis-ci.org/chronologic/eth-alarm-clock-dapp)
[![Greenkeeper badge](https://badges.greenkeeper.io/chronologic/eth-alarm-clock-dapp.svg)](https://greenkeeper.io/)
[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=SFFlRGMwbTVFUlpaVVNud2ZrcHlET1VLdWhQSFM5VngrWmRKY3UrbUxrOD0tLU9BMHFaWTliOHk3Q29LSDhlcDNRV1E9PQ==--2127056c69c0489e4bdca6546c40bb7ebd26c671)](https://www.browserstack.com/automate/public-build/SFFlRGMwbTVFUlpaVVNud2ZrcHlET1VLdWhQSFM5VngrWmRKY3UrbUxrOD0tLU9BMHFaWTliOHk3Q29LSDhlcDNRV1E9PQ==--2127056c69c0489e4bdca6546c40bb7ebd26c671)


__Homepage:__ [Ethereum Alarm Clock](http://www.ethereum-alarm-clock.com/)

__Looking for the latest install?__ [Latest Releases](https://github.com/chronologic/eth-alarm-clock-dapp/releases)

__Want to run a TimeNode?__ [Guide](https://blog.chronologic.network/how-to-prove-day-ownership-to-be-a-timenode-3dc1333c74ef)

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
If you wish to run the DApp as a Docker container, we have a Docker [image](Dockerfile) prepared for you.
To run the container, use the following commands:
1. Build the image - `docker build -t eac_dapp https://raw.githubusercontent.com/chronologic/eth-alarm-clock-dapp/master/dappnode/build/Dockerfile`
2. Run the container - `docker run --name eac_dapp -d -p 8080:80 eac_dapp`
3. Visit `localhost:8080` in your browser to see the DApp running

### DAppNode
You can now run a TimeNode through [DAppNode](https://dappnode.io/):
- Search the DAppNode Installer for `timenode.public.dappnode.eth`
- Click Install
- Go to `my.timenode.public.dappnode.eth` in your browser.

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
