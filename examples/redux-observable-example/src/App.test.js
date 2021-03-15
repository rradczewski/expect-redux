import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expectRedux, storeSpy } from "expect-redux";

import App from "./App";
import Api from "./Api";
import { configureStore } from "./store";

jest.mock("./Api");

describe("App Component", () => {
  beforeEach(() => jest.resetAllMocks());

  let store;
  let container;
  beforeEach(() => {
    store = configureStore([storeSpy]);
    const rendered = render(<App store={store} />);
    container = rendered.container;
  });

  const fillInUserName = async (value) =>
    await act(async () =>
      fireEvent.change(screen.getByTestId("username"), { target: { value } })
    );

  const fillInPassword = async (value) =>
    await act(async () =>
      fireEvent.change(screen.getByTestId("password"), { target: { value } })
    );

  const submitForm = async () =>
    await act(async () => fireEvent.click(screen.getByTestId("login")));

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

      expect(container).toHaveTextContent("Thanks for logging in.");
    });

    it("won't work if you supply bad credentials", async () => {
      Api.authorize.mockRejectedValue("INVALID CREDENTIALS");

      await fillInUserName("MY_USER");
      await fillInPassword("MY_WRONG_PASSWORD");
      await submitForm();

      await expectRedux(store).toDispatchAnAction().ofType("LOGIN_ERROR");

      expect(container).toHaveTextContent("Invalid credentials");
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
      await act(async () => {
        fireEvent.click(screen.getByTestId("logout"));
      });

      await expectRedux(store).toDispatchAnAction().ofType("LOGOUT");

      expect(container).toHaveTextContent("Please login below");
    });
  });
});
