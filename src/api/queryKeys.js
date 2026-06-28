const makeKey = (resource) => [resource];

const queryKeys = new Proxy({}, {
  get(_, prop) {
    return makeKey(prop);
  }
});

export default queryKeys;
