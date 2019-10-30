import Bb from 'bluebird';
import BigNumber from 'bignumber.js';

const getDAYBalance = async (network, web3, address) => {
  const dayTokenAddress = network.dayTokenAddress;
  const dayTokenAbi = network.dayTokenAbi;

  const contract = new web3.eth.Contract(dayTokenAbi, dayTokenAddress);

  const balanceNum = await contract.methods.balanceOf(address).call();
  const balanceDAY = new BigNumber(web3.utils.fromWei(String(balanceNum), 'ether'));

  const mintingPower =
    process.env.NODE_ENV === 'docker'
      ? 0
      : await Bb.fromCallback(callback => {
          contract.methods.getMintingPowerByAddress(address).call(null, callback);
        });

  return { balanceDAY, mintingPower };
};

export { getDAYBalance };
