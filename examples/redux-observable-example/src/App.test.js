import React from "react";
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
    component.find("#username").simulate("change", { target: { value } });

  const fillInPassword = value =>
    component.find("#password").simulate("change", { target: { value } });

  const submitForm = () =>
    component.find("#login").simulate("click", { button: 0 });

  describe("logging in", () => {
    it("will work with correct credentials", async () => {
      Api.authorize.mockResolvedValue("SOME_TOKEN");

      fillInUserName("MY_USER");
      fillInPassword("MY_PASSWORD");
      submitForm();

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

      fillInUserName("MY_USER");
      fillInPassword("MY_WRONG_PASSWORD");
      submitForm();

      await expectRedux(store)
        .toDispatchAnAction()
        .ofType("LOGIN_ERROR");

      expect(component.text()).toContain("Invalid credentials");
    });
  });

  describe("Logging out", () => {
    beforeEach(async () => {
      Api.authorize.mockResolvedValue("SOME_TOKEN");

      fillInUserName("MY_USER");
      fillInPassword("MY_PASSWORD");
      submitForm();

      await expectRedux(store)
        .toDispatchAnAction()
        .ofType("LOGIN_SUCCESS");

      component.update();
    });

    it("works when logged in", async () => {
      component.find("#logout").simulate("click", { button: 0 });

      await expectRedux(store)
        .toDispatchAnAction()
        .ofType("LOGGED_OUT");

      expect(component.text()).toContain("Please login below");
    });
  });
});
