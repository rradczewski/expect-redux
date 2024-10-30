const { createStore, applyMiddleware, compose } = require("redux");
const { thunk } = require("redux-thunk");

const reducer = (state = {}) => state;

module.exports = {
  configureStore: (storeEnhancers = []) =>
    createStore(reducer, compose(applyMiddleware(thunk), ...storeEnhancers)),
};
