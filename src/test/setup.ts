// jsdom lacks these browser APIs; stub them so components mount in unit tests.
window.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList

HTMLImageElement.prototype.decode ??= () => Promise.resolve()
