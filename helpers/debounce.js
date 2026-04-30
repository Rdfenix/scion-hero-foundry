export function _debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

export function createDebouncedRender(sheet, delay = 150) {
  let renderTimeout;
  let pendingParts = new Set();

  return function debouncedRender(parts = []) {
    parts.forEach((p) => pendingParts.add(p));

    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
      if (pendingParts.size > 0) {
        sheet.render({ parts: Array.from(pendingParts) });
        pendingParts.clear();
      }
    }, delay);
  };
}
