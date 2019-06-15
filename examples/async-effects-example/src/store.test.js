const { expectRedux, storeSpy } = require("expect-redux");
const { configureStore } = require("./store");

const storeForTest = () => configureStore([storeSpy]);

const effect = dispatch => {
  dispatch({ type: "REQUEST_STARTED" });

  return fetch("/api/count").then(result => {
    if (result.ok) {
      return result.json().then(jsonBody => {
        dispatch({
          type: "REQUEST_SUCCESS",
          payload: jsonBody.count
        });
      });
    }
  });
};

describe("service", () => {
  it("retrieves the current count", () => {
    const store = storeForTest();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ count: 42 })
    });

    store.dispatch(effect);

    return expectRedux(store)
      .toDispatchAnAction()
      .matching({
        type: "REQUEST_SUCCESS",
        payload: 42
      });
  });
});
