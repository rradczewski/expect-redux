// @flow
import type { Store } from "redux";
import { timeoutSymbol } from "./storeSpy";

import { MatcherPromise } from "./matcher";

import { sprintf } from "sprintf-js";
import { propEq, equals, allPass } from "ramda";

type BetterErrorMessagesOptions = {
  timeout: number
};

let betterErrorMessages: boolean | BetterErrorMessagesOptions = false;

const expectRedux = (
  store: Store<*, *, *>
): { toDispatchAnAction: () => MatcherPromise } => {
  if (betterErrorMessages !== false) {
    const timeout: number = (betterErrorMessages: any).timeout;
    setTimeout(() => store[timeoutSymbol](timeout), timeout);
  }
  return {
    toDispatchAnAction: (): MatcherPromise => MatcherPromise.empty(store)
  };
};

expectRedux.enableBetterErrorMessages = (
  options: boolean | BetterErrorMessagesOptions
) => {
  betterErrorMessages = options;
};

export default expectRedux;
