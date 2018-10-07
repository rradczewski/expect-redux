// @flow
export interface PromiseLike {
  then(
    onFulfill: (result: any) => PromiseLike | mixed,
    onReject?: (error: any) => PromiseLike | mixed
  ): PromiseLike;
  catch(onReject: (error: any) => PromiseLike | mixed): PromiseLike;
}
