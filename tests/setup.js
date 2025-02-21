global.ResizeObserver = jest.fn(() => {
  return {
    observe() {},
    unobserve() {},
    disconnect() {},
  };
});
