const { expectRedux, storeSpy } = require("expect-redux");
const { configureStore } = require("./store");

const storeForTest = () => configureStore([storeSpy]);

const effect = async dispatch => {
  dispatch({ type: "REQUEST_STARTED" });

  const result = await fetch("/api/count");

  if (result.ok) {
    dispatch({
      type: "REQUEST_SUCCESS",
      payload: (await result.json()).count
    });
  }
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
