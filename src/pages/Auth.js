import React, { Component } from 'react';
import './Auth.css';
import AuthContext from '../contexts/auth-context';

class AuthPage extends Component {
  state = {
    isLogin: true
  }

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
  }

  switchModeHandler = () => {
    this.setState(prevState => {
      return { isLogin: !prevState.isLogin };
    })
  }


  handleSignup(email, password) {
    const { clientConn } = this.context;

    clientConn.post('/client/user', { username: email, password: password })
      .then(() => {
        alert(`User ${email} is created successfully!`);
        this.setState({ isLogin: true });
      })
      .catch(error => {
        alert(error.response.data.error);
      })
  }

  handleLogin(email, password) {
    const { login, clientConn } = this.context;

    clientConn.post('/client/login', { username: email, password: password }, { withCredentials: true })
      .then(data => {
        const { access_token, role } = data.data;
        login(email, access_token, role);
      })
      .catch(error => {
        alert(error.response.data.error);
      });
  }

  submitHandler = event => {
    event.preventDefault();

    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    if (this.state.isLogin)
      this.handleLogin(email, password);
    else
      this.handleSignup(email, password);
  }

  render() {
    return <form className="auth-form" onSubmit={this.submitHandler}>
      <div className="form-control">
        <label htmlFor="email">E-Mail</label>
        <input type="email" id="email" ref={this.emailEl} />
      </div>
      <div className="form-control">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" ref={this.passwordEl} />
      </div>
      <div className="form-actions">
        <button type="submit">Submit</button>
        <button type="button" onClick={this.switchModeHandler}>
          Switch to {this.state.isLogin ? "Signup" : "Login"}
        </button>
      </div>
    </form>
  }
}

export default AuthPage;