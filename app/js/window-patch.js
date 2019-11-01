// window is not defined in the worker context
// this makes window globally available for scripts that expect it
if (self) {
  self.window = self;
}
