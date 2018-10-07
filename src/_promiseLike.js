// @flow
export interface PromiseLike {
  then(onFulfill: null | void, onReject: (error: any) => PromiseLike | mixed): PromiseLike;
  catch(onReject: (error: any) => PromiseLike | mixed): PromiseLike;
}