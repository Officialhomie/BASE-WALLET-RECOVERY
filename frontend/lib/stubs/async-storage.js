/**
 * Browser stub for @react-native-async-storage/async-storage.
 * MetaMask SDK expects this in React Native; in browser we use no-ops / localStorage.
 */
const noop = () => Promise.resolve();
const stub = {
  getItem: (key) => Promise.resolve(typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
  setItem: (key, value) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    return Promise.resolve();
  },
  getAllKeys: () => Promise.resolve(typeof localStorage !== 'undefined' ? Object.keys(localStorage) : []),
  clear: noop,
  multiGet: () => Promise.resolve([]),
  multiSet: noop,
  multiRemove: noop,
};
module.exports = stub;
module.exports.default = stub;
