import { createStore, applyMiddleware, compose } from "redux";
import { withExtraArgument } from "redux-thunk";

const reducer = (state = { counter: 0 }, action) => {
  if (action.type === "INCREASE_COUNTER_LOCALLY") {
    return { counter: state.counter + 1 };
  }
  if (action.type === "SET_COUNTER_FROM_REMOTE") {
    return { counter: action.counter };
  }
  return state;
};

export const configureStore = (services = {}, storeEnhancers = []) =>
  createStore(
    reducer,
    compose(
      ...[applyMiddleware(withExtraArgument(services)), ...storeEnhancers]
    )
  );

export const increaseCounterLocallyActionCreator = (dispatch) =>
  dispatch({ type: "INCREASE_COUNTER_LOCALLY" });

export const increaseCounterRemotely = async (
  dispatch,
  getState,
  { counterService }
) => {
  const counter = await counterService();
  dispatch({ type: "SET_COUNTER_FROM_REMOTE", counter: counter });
};
