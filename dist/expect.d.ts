import { ActionMatcher } from "./action_matcher";
import { StateMatcher } from "./state_matcher";
import { StoreWithSpy } from "./storeSpy";
declare const expectRedux: {
    (store: StoreWithSpy<any, any>): {
        toHaveState: () => StateMatcher;
        toDispatchAnAction: () => ActionMatcher;
        toNotDispatchAnAction: (dispatchTimeout: number) => ActionMatcher;
    };
    enableBetterErrorMessages(options: boolean | BetterErrorMessagesOptions): void;
    options: Options;
    configure(options: Options): {
        betterErrorMessagesTimeout: number | false;
    };
};
declare type BetterErrorMessagesOptions = {
    timeout: number;
};
declare type Options = {
    betterErrorMessagesTimeout: number | false;
};
export default expectRedux;
