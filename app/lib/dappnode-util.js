const isRunningInDAppNode = () => {
  return process.env.DAPPNODE || false;
};

export { isRunningInDAppNode };
