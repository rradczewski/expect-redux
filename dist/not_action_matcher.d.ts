import { ActionMatcher } from "./action_matcher";
import { StoreWithSpy } from "./storeSpy";
declare class NotActionMatcher extends ActionMatcher {
    static empty: (...args: any) => ActionMatcher;
    constructor(predicate: (action: any) => boolean, errorMessage: string, store: StoreWithSpy<any, any>, timeout: number);
    onTimeout(): void;
    test(action: any): void;
    fail(): void;
    and(otherPredicate: (action: any) => boolean, otherErrorMessage: string): NotActionMatcher;
}
export { NotActionMatcher };
