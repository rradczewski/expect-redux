import React from 'react';
import { mount } from 'enzyme';
import { expectRedux, storeSpy } from 'expect-redux';

import App from './App';
import { configureStore } from './store';

it('will increase the counter', () => {
  const services = {
    counterService: () =>
      new Promise(resolve => setTimeout(() => resolve(2), 0))
  };
  const store = configureStore(services, [storeSpy]);
  const component = mount(<App store={store} />);

  component.find('#increase-remotely').simulate('click');

  return expectRedux(store)
    .toDispatchAnAction()
    .matching({ type: 'SET_COUNTER_FROM_REMOTE', counter: 2 });
});
