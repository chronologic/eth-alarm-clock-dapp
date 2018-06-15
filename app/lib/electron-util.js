const isRunningInElectron = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.indexOf(' electron/') > -1;
};

export { isRunningInElectron };
