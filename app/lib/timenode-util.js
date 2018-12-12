import Bb from 'bluebird';

const getDAYBalance = async (network, web3, address) => {
  const dayTokenAddress = network.dayTokenAddress;
  const dayTokenAbi = network.dayTokenAbi;

  const contract = web3.eth.contract(dayTokenAbi).at(dayTokenAddress);

  const balanceNum = await Bb.fromCallback(callback => contract.balanceOf(address, callback));
  const balanceDAY = web3.utils.fromWei(balanceNum, 'ether');

  const mintingPower =
    process.env.NODE_ENV === 'docker'
      ? 0
      : await Bb.fromCallback(callback => {
          contract.getMintingPowerByAddress(address, callback);
        });

  return { balanceDAY, mintingPower };
};

export { getDAYBalance };
