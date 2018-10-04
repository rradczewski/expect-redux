export const assertPromiseDidNotResolve = promise => {
  let isDone = false;
  promise.then(() => {
    isDone = true;
  });

  return Promise.resolve().then(
    () => (isDone ? Promise.reject("Promise was resolved") : Promise.resolve())
  );
};
