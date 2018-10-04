// @flow
import type { Store } from "redux";
import { propEq, equals, allPass } from "ramda";

import { MatcherPromise } from "./matcher";

type BetterErrorMessagesOptions = {
  timeout: number
};

let betterErrorMessages: boolean | BetterErrorMessagesOptions = false;

const expectRedux = (
  store: Store<*, *, *> & { timeout: number => mixed }
): { toDispatchAnAction: () => MatcherPromise } => {
  if (betterErrorMessages !== false) {
    const timeout: number = (betterErrorMessages: any).timeout;
    setTimeout(() => store.timeout(timeout), timeout);
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
