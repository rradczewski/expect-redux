import React from "react";
import { connect } from "react-redux";

class App extends React.Component {
  state = {
    username: "",
    password: ""
  };

  tryLogin = () => this.props.loginRequest(this.state.username, this.state.password);

  render() {
    const { isLoggedIn, loginError } = this.props;
    const { username, password } = this.state;
    return (
      <div>
        {isLoggedIn ? (
          <div>
            <p>Thanks for logging in.</p>
            <button id="logout" onClick={this.props.logout}>Logout</button>
          </div>
        ) : (
          <div>
            {loginError && <p>Invalid credentials. Please try again</p>}
            <p>Please login below</p>
            <form onSubmit={this.tryLogin}>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => this.setState({ username: e.target.value })}
              />
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => this.setState({ password: e.target.value })}
              />
              <button id="login" onClick={this.tryLogin}>Login</button>
            </form>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ isLoggedIn, loginError }) => ({ isLoggedIn, loginError });
const mapDispatchToProps = {
  loginRequest: (user, password) => ({ type: "LOGIN_REQUEST", user, password }),
  logout: () => ({ type: "DO_LOGOUT" })
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
