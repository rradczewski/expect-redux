import { ActionMatcher } from "./action_matcher";
import { NotActionMatcher } from "./not_action_matcher";
import { StateMatcher } from "./state_matcher";
import { StoreWithSpy } from "./storeSpy";

const expectRedux = (store: StoreWithSpy<any, any>) => {
  const timeout = expectRedux.options.betterErrorMessagesTimeout;

  return {
    toHaveState: (): StateMatcher => StateMatcher.empty(store),
    toDispatchAnAction: (): ActionMatcher =>
      ActionMatcher.empty(store, timeout),
    toNotDispatchAnAction: (dispatchTimeout: number): ActionMatcher =>
      NotActionMatcher.empty(store, dispatchTimeout)
  };
};

type BetterErrorMessagesOptions = {
  timeout: number;
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
      typeof options === "boolean"
        ? false
        : (<BetterErrorMessagesOptions>options).timeout
  });
};

type Options = {
  betterErrorMessagesTimeout: number | false;
};
expectRedux.options = <Options>{ betterErrorMessagesTimeout: false };

expectRedux.configure = (options: Options) =>
  (expectRedux.options = { ...expectRedux.options, ...options });

export default expectRedux;
