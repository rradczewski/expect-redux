import { Action, Store, StoreEnhancer } from "redux";
import { ActionMatcher } from "./action_matcher";
declare type SpyExtension = {
    actions: Array<Action>;
    registerMatcher: (matcher: ActionMatcher) => void;
    unregisterMatcher: (matcher: ActionMatcher) => void;
};
export declare type StoreWithSpy<S, A extends Action<any>> = Store<S, A> & SpyExtension;
declare const storeEnhancer: StoreEnhancer<SpyExtension, {}>;
export default storeEnhancer;
