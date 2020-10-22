import React, { Component } from 'react';
import './Auth.css';
import AuthContext from '../contexts/auth-context';
import axios from 'axios';

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

  submitHandler = event => {
    console.log("onSubmit");
    const { baseURL, login } = this.context;
    event.preventDefault();
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    axios.post(baseURL + '/client/login', { username: email, password: password })
      .then(data => {
        console.log(data);
        const { access_token, refresh_token } = data.data;
        login(email, access_token, refresh_token);
      })
      .catch(error => {
        console.log(error.response);
        alert(error.response.data.error);
      });
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
      </div>
    </form>
  }
}

export default AuthPage;