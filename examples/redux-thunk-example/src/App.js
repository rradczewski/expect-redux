import React from "react";
import { connect } from "react-redux";

import {
  increaseCounterLocallyActionCreator,
  increaseCounterRemotely,
} from "./store";

const App = ({ counter, increaseLocally, increaseRemotely }) => (
  <div>
    Current counter value is <span data-testid="counter-value">{counter}</span>. Want to
    increase it
    <button data-testid="increase-locally" onClick={increaseLocally}>
      locally
    </button>
    {" or "}
    <button data-testid="increase-remotely" onClick={increaseRemotely}>
      on the server
    </button>
  </div>
);

const mapDispatchToProps = (dispatch) => ({
  increaseLocally: () => dispatch(increaseCounterLocallyActionCreator),
  increaseRemotely: () => dispatch(increaseCounterRemotely),
});

export default connect(({ counter }) => ({ counter }), mapDispatchToProps)(App);
