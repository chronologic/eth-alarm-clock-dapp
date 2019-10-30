// window is not defined in the worker context
// so we need to patch it for some packages that expect it to be(*cough* web3 *cough*)
if (self) {
  self.window = self;
}
