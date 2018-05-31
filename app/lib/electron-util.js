const isRunningInElectron = () => {
  // location.search.indexOf('mode=electron') > -1;
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf(' electron/') > -1) {
    return true;
  }
  return false;
};

export { isRunningInElectron };
