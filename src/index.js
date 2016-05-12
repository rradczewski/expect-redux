import actions from './actions';
import storeSpyLib from './storeSpy';

export const storeSpy = storeSpyLib;

export const expectRedux = {
  toDispatchAnAction: actions
};