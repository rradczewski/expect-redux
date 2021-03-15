import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expectRedux, storeSpy } from "expect-redux";

import App from "./App";
import { configureStore } from "./store";

it("will increase the counter", async () => {
  const store = configureStore({}, [storeSpy]);
  render(<App store={store} />);

  await act(async () => {
    fireEvent.click(screen.getByTestId("increase-locally"));
  });

  return expectRedux(store)
    .toDispatchAnAction()
    .matching({ type: "INCREASE_COUNTER_LOCALLY" });
});

it("can be verified what the state of the store is afterwards", async () => {
  const store = configureStore({}, [storeSpy]);
  render(<App store={store} />);

  expect(store.getState().counter).toEqual(0);
  await act(async () => {
    fireEvent.click(screen.getByTestId("increase-locally"));
  });

  await expectRedux(store)
    .toDispatchAnAction()
    .matching({ type: "INCREASE_COUNTER_LOCALLY" });

  expect(store.getState().counter).toEqual(1);
});

it("can be verified what the state of the component is afterwards", async () => {
  const store = configureStore({}, [storeSpy]);
  render(<App store={store} />);

  expect(screen.getByTestId("counter-value")).toHaveTextContent("0");

  await act(async () => {
    fireEvent.click(screen.getByTestId("increase-locally"));
  });

  await expectRedux(store)
    .toDispatchAnAction()
    .matching({ type: "INCREASE_COUNTER_LOCALLY" });

  expect(screen.getByTestId("counter-value")).toHaveTextContent("1");
});
