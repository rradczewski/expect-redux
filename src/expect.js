// @flow
import type { StoreWithSpy } from "./storeSpy";
import { propEq, equals, allPass } from "ramda";

import { MatcherPromise } from "./matcher";

const expectRedux = (
  store: StoreWithSpy<*, *, *> & { timeout: number => mixed }
): { toDispatchAnAction: () => MatcherPromise } => {
  if (expectRedux.options.betterErrorMessagesTimeout !== false) {
    const timeout: number = expectRedux.options.betterErrorMessagesTimeout;
    setTimeout(() => store.timeout(timeout), timeout);
  }

  return {
    toDispatchAnAction: (): MatcherPromise => MatcherPromise.empty(store)
  };
};

type BetterErrorMessagesOptions = {
  timeout: number
};

/* Deprecated, use expectRedux.configure */
expectRedux.enableBetterErrorMessages = (
  options: boolean | BetterErrorMessagesOptions
) => {
  console.warn(
    "expectRedux.enableBetterErrorMessages is deprecated. Replace with `expectRedux.configure({ betterErrorMessagesTimeout: 100 })`"
  );
  expectRedux.configure({
    betterErrorMessagesTimeout:
      typeof options.timeout === "number" ? options.timeout : false
  });
};

type Options = {
  betterErrorMessagesTimeout: number | false
};
expectRedux.options = { betterErrorMessagesTimeout: false };

expectRedux.configure = (options: Options) =>
  (expectRedux.options = { ...expectRedux.options, ...options });

export default expectRedux;
