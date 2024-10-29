import { StoreEnhancer, Action, Store } from 'redux';

type SpyExtension = {
    actions: Array<Action>;
    registerMatcher: (matcher: ActionMatcher) => void;
    unregisterMatcher: (matcher: ActionMatcher) => void;
};
type StoreWithSpy<S, A extends Action<any>> = Store<S, A> & SpyExtension;
declare const storeEnhancer: StoreEnhancer<SpyExtension, {}>;

interface PromiseLike {
    then(onFulfill: (result: any) => PromiseLike | unknown, onReject?: (error: any) => PromiseLike | unknown): PromiseLike;
    catch(onReject: (error: any) => PromiseLike | unknown): PromiseLike;
}

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

declare class StateMatcher implements PromiseLike {
    static empty: (...args: any) => StateMatcher;
    store: StoreWithSpy<any, any>;
    predicate: (state: unknown) => boolean;
    errorMessage: string;
    timeout: number | false;
    timeoutId: any;
    innerPromise: Promise<any>;
    _resolve: Function;
    _reject: Function;
    unsubscribe: Function;
    constructor(predicate: (state: unknown) => boolean, errorMessage: string, store: StoreWithSpy<any, any>, timeout: number | false);
    destroy(): void;
    resolve(): void;
    reject(e?: Error): void;
    onTimeout(): void;
    test(): void;
    matching(expectedState: unknown): StateMatcher;
    withSubtree(selector: (state: any) => unknown): StateMatcher;
    then(onFulfill?: (result: any) => PromiseLike | unknown, onReject?: (error: any) => PromiseLike | unknown): Promise<unknown>;
    catch(onReject: (error: any) => PromiseLike | unknown): Promise<any>;
    end(cb: Function): Promise<unknown>;
}

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
type BetterErrorMessagesOptions = {
    timeout: number;
};
type Options = {
    betterErrorMessagesTimeout: number | false;
};

export { expectRedux, storeEnhancer as storeSpy };
