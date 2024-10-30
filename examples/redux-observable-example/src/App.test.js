import { render, act, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { expectRedux, storeSpy } from "expect-redux";

import App from "./App";
import Api from "./Api";
import { configureStore } from "./store";

jest.mock("./Api");

describe("App Component", () => {
  beforeEach(() => jest.resetAllMocks());

  let store, component;
  beforeEach(() => {
    store = configureStore([storeSpy]);
    component = render(<App store={store} />);
  });

  const fillInUserName = (value) =>
    act(async () =>
      fireEvent.change(screen.getByTestId("username"), { target: { value } })
    );

  const fillInPassword = (value) =>
    act(async () =>
      fireEvent.change(screen.getByTestId("password"), { target: { value } })
    );

  const submitForm = () =>
    act(async () => fireEvent.submit(screen.getByTestId("login")));

  describe("logging in", () => {
    it("will work with correct credentials", async () => {
      Api.authorize.mockResolvedValue("SOME_TOKEN");

      await fillInUserName("MY_USER");
      await fillInPassword("MY_PASSWORD");
      await submitForm();

      await expectRedux(store).toDispatchAnAction().matching({
        type: "LOGIN_REQUEST",
        user: "MY_USER",
        password: "MY_PASSWORD",
      });

      await expectRedux(store).toDispatchAnAction().ofType("LOGIN_SUCCESS");

      expect(document.body.textContent).toContain("Thanks for logging in.");
    });

    it("won't work if you supply bad credentials", async () => {
      Api.authorize.mockRejectedValue("INVALID CREDENTIALS");

      await fillInUserName("MY_USER");
      await fillInPassword("MY_WRONG_PASSWORD");
      await submitForm();

      await expectRedux(store).toDispatchAnAction().ofType("LOGIN_ERROR");

      expect(document.body.textContent).toContain("Invalid credentials");
    });
  });

  describe("Logging out", () => {
    beforeEach(async () => {
      Api.authorize.mockResolvedValue("SOME_TOKEN");

      await fillInUserName("MY_USER");
      await fillInPassword("MY_PASSWORD");
      await submitForm();

      await expectRedux(store).toDispatchAnAction().ofType("LOGIN_SUCCESS");
    });

    it("works when logged in", async () => {
      act(() => {
        fireEvent.click(screen.getByTestId("logout"));
      });

      await expectRedux(store).toDispatchAnAction().ofType("LOGOUT");

      expect(document.body.textContent).toContain("Please login below");
    });
  });
});
