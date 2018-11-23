# How to release to DAppNode
0. If you haven't already, create your own DAppNode on Heroku and connect to it through a VPN
1. Make sure the DApp version number (e.g. 1.1.6) in the following files matches the one in `package.json`
    - `dappnode_package.json`
    - `docker-compose.yml`
1. Test the new release: 
    - `dappnode build`
    - Take the IPFS hash that was given to you and install it in your local DAppNode.
    - Go to http://my.eth-alarm-clock-dapp.public.dappnode.eth/ and test the functionality
2. If everything looks OK, publish it with `dappnode publish`

Note: If you're having troubles setting up the DAppNode SDK, follow points 1, 2, 4 and 5 of this guide https://github.com/dappnode/DAppNodeSDK/wiki/DAppNode-SDK-tutorial.