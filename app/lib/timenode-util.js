const getDAYBalance = async (network, web3, address) => {
  const dayTokenAddress = network.dayTokenAddress;
  const dayTokenAbi = network.dayTokenAbi;

  const contract = new web3.eth.Contract(dayTokenAbi, dayTokenAddress);

  const balanceNum = await contract.methods.balanceOf(address).call();
  const balanceDAY = web3.utils.fromWei(balanceNum, 'ether');

  const mintingPower =
    process.env.NODE_ENV === 'docker'
      ? 0
      : await contract.methods.getMintingPowerByAddress(address).call();

  return { balanceDAY, mintingPower };
};

export { getDAYBalance };
