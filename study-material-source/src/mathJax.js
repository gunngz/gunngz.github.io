let queue = Promise.resolve();

export function typesetMath(root, isActive = () => true) {
  queue = queue.then(async () => {
    const mathJax = window.MathJax;
    if (!root?.isConnected || !isActive() || !mathJax?.typesetPromise) return;
    await mathJax.startup?.promise;
    if (!root.isConnected || !isActive()) return;
    mathJax.typesetClear?.([root]);
    await mathJax.typesetPromise([root]);
  }).catch(() => {});
  return queue;
}
