import React from "react";
import { act, screen, fireEvent, render } from "@testing-library/react";
import { expectRedux, storeSpy } from "expect-redux";

import App from "./App";
import { configureStore } from "./store";

it("will increase the counter", async () => {
  const services = {
    counterService: () =>
      new Promise((resolve) => setTimeout(() => resolve(2), 0)),
  };
  const store = configureStore(services, [storeSpy]);
  render(<App store={store} />);

  await act(async () => {
    fireEvent.click(screen.getByTestId("increase-remotely"));
    await new Promise((resolve) => setTimeout(resolve));
  });

  return expectRedux(store)
    .toDispatchAnAction()
    .matching({ type: "SET_COUNTER_FROM_REMOTE", counter: 2 });
});
