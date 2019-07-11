export interface PromiseLike {
  then(
    onFulfill: (result: any) => PromiseLike | unknown,
    onReject?: (error: any) => PromiseLike | unknown
  ): PromiseLike;
  catch(onReject: (error: any) => PromiseLike | unknown): PromiseLike;
}
