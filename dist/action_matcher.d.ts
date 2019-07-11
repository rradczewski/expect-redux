import { StoreWithSpy } from "./storeSpy";
import { PromiseLike } from "./_promiseLike";
declare class ActionMatcher implements PromiseLike {
    innerPromise: Promise<any>;
    store: StoreWithSpy<any, any>;
    _resolve: Function;
    _reject: Function;
    errorMessage: string;
    predicate: (action: any) => boolean;
    timeout: number | false;
    timeoutId: any;
    static empty: (...args: any) => ActionMatcher;
    constructor(predicate: (action: any) => boolean, errorMessage: string, store: StoreWithSpy<any, any>, timeout: number | false);
    resolve(): void;
    reject(e: Error): void;
    onTimeout(): void;
    destroy(): void;
    test(action: any): void;
    then(onFulfill?: (result: any) => PromiseLike | unknown, onReject?: (error: any) => PromiseLike | unknown): Promise<unknown>;
    catch(onReject: (error: any) => PromiseLike | unknown): Promise<any>;
    end(cb: Function): Promise<unknown>;
    and(otherPredicate: (action: any) => boolean, otherErrorMessage: string): ActionMatcher;
    ofType(type: string): ActionMatcher;
    matching(objectOrPredicate: Object | ((action: any) => boolean)): ActionMatcher;
    asserting(assertion: (action: any) => any): ActionMatcher;
}
export { ActionMatcher };
