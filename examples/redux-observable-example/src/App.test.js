import React from "react";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
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
    component = mount(<App store={store} />);
  });

  const fillInUserName = value =>
    act(async () =>
      component.find("#username").simulate("change", { target: { value } })
    );

  const fillInPassword = value =>
    act(async () =>
      component.find("#password").simulate("change", { target: { value } })
    );

  const submitForm = () =>
    act(async () => component.find("#login").simulate("click", { button: 0 }));

  describe("logging in", () => {
    it("will work with correct credentials", async () => {
      Api.authorize.mockResolvedValue("SOME_TOKEN");

      await fillInUserName("MY_USER");
      await fillInPassword("MY_PASSWORD");
      await submitForm();

      await expectRedux(store)
        .toDispatchAnAction()
        .matching({
          type: "LOGIN_REQUEST",
          user: "MY_USER",
          password: "MY_PASSWORD"
        });

      await expectRedux(store)
        .toDispatchAnAction()
        .ofType("LOGIN_SUCCESS");

      expect(component.text()).toContain("Thanks for logging in.");
    });

    it("won't work if you supply bad credentials", async () => {
      Api.authorize.mockRejectedValue("INVALID CREDENTIALS");

      await fillInUserName("MY_USER");
      await fillInPassword("MY_WRONG_PASSWORD");
      await submitForm();

      await expectRedux(store)
        .toDispatchAnAction()
        .ofType("LOGIN_ERROR");

      expect(component.text()).toContain("Invalid credentials");
    });
  });

  describe("Logging out", () => {
    beforeEach(async () => {
      Api.authorize.mockResolvedValue("SOME_TOKEN");

      await fillInUserName("MY_USER");
      await fillInPassword("MY_PASSWORD");
      await submitForm();

      await expectRedux(store)
        .toDispatchAnAction()
        .ofType("LOGIN_SUCCESS");

      component.update();
    });

    it("works when logged in", async () => {
      act(() => {
        component.find("#logout").simulate("click", { button: 0 });
      });

      await expectRedux(store)
        .toDispatchAnAction()
        .ofType("LOGOUT");

      expect(component.text()).toContain("Please login below");
    });
  });
});
