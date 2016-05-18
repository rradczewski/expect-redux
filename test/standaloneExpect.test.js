import { expectRedux } from '../src/';
import expect from 'expect';

expect.extend(expectRedux);
describe('standalone expect function', () => {
  it('exposes the same functionality as extending expectjs', () => {
    const fakeStore = {};

    const standaloneMatcher = expectRedux(fakeStore).toDispatchAnAction;
    const expectMatcher = expect(fakeStore).toDispatchAnAction;

    expect(typeof standaloneMatcher).toEqual('function');
    expect(standaloneMatcher).toBe(expectMatcher);
  });
});