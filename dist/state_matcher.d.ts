import { StoreWithSpy } from "./storeSpy";
import { PromiseLike } from "./_promiseLike";
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
export { StateMatcher };
