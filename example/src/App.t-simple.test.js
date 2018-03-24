import React from 'react';
import { mount } from 'enzyme';
import { expectRedux, storeSpy } from 'expect-redux';

import App from './App';
import { configureStore } from './store';

it('will increase the counter', () => {
  const store = configureStore({}, [storeSpy]);
  const component = mount(<App store={store} />);

  component.find('#increase-locally').simulate('click');

  return expectRedux(store)
    .toDispatchAnAction()
    .matching({ type: 'INCREASE_COUNTER_LOCALLY' });
});

it('can be verified what the state of the store is afterwards', async () => {
  const store = configureStore({}, [storeSpy]);
  const component = mount(<App store={store} />);

  expect(store.getState().counter).toEqual(0);
  component.find('#increase-locally').simulate('click');

  await expectRedux(store)
    .toDispatchAnAction()
    .matching({ type: 'INCREASE_COUNTER_LOCALLY' });

  expect(store.getState().counter).toEqual(1);
});

it('can be verified what the state of the component is afterwards', async () => {
  const store = configureStore({}, [storeSpy]);
  const component = mount(<App store={store} />);

  expect(component.find('#counter-value').text()).toEqual('0');
  component.find('#increase-locally').simulate('click');

  await expectRedux(store)
    .toDispatchAnAction()
    .matching({ type: 'INCREASE_COUNTER_LOCALLY' });

  expect(component.find('#counter-value').text()).toEqual('1');
});
