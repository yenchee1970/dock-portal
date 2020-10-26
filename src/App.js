import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';
import MainNavigation from './components/MainNavigation';
import AuthContext from './contexts/auth-context';
import AuthPage from './pages/Auth';
import Cookies from 'js-cookie';
import axios from 'axios';
import OrgPage from './pages/Organization';
import UserPage from './pages/User';
import DockPage from './pages/Dock';

const COOKIES_EXPIRES = 10;

class App extends Component {
  state = {
    refreshToken: null,
    accessToken: null,
    username: null,
    isAuth: false,
    baseURL: '',
    login: (username, accessToken, refreshToken) => { },
    logout: () => { },
    refresh: () => { },
    isInitialized: false
  }

  isInitialized = false;

  constructor(props) {
    super(props);
    this.state.baseURL = 'https://dock-api.dyndns.org';
    this.state.login = this.login;
    this.state.logout = this.logout;
    this.state.refresh = this.refresh;
  }

  componentDidMount() {
    let refreshToken = Cookies.get('refresh');
    let username = Cookies.get('username');
    if (refreshToken) {
      this.refresh_token(username, refreshToken)
        .then(access_token => {
          if (access_token)
            this.setState({
              refreshToken: refreshToken,
              username: username,
              isAuth: true,
              accessToken: access_token,
              isInitialized: true
            });
          else
            this.setState({ refreshToken: null, username: null, isInitialized: true });
        });
    } else {
      this.setState({ refreshToken: null, username: null, isInitialized: true });
    }
  }

  login = (username, accessToken, refreshToken) => {
    this.setState({ username: username, accessToken: accessToken, refreshToken: refreshToken, isAuth: true });
    Cookies.set('refresh', refreshToken, { expires: COOKIES_EXPIRES });
    Cookies.set('username', username, { expires: COOKIES_EXPIRES });
  }

  logout = () => {
    this.setState({ username: null, accessToken: null, refreshToken: null, isAuth: false });
    Cookies.remove('refresh');
    Cookies.remove('username');
  }

  refresh = () => {
    this.refresh_token(this.state.username, this.state.refreshToken)
      .then(access_token => {
        if (access_token)
          this.setState({ accessToken: access_token });
        else
          this.logout();
      })
  }

  refresh_token(username, refreshToken) {
    console.log("Refreshing")
    return new Promise((resolve, reject) => {
      axios.post(this.state.baseURL + '/client/refresh', { username: username }, { headers: { 'Authorization': `Bearer ${refreshToken}` } })
        .then(data => {
          console.log(data.data);
          Cookies.set("refresh", data.data.refresh_token, { expires: COOKIES_EXPIRES });
          Cookies.set('username', username, { expires: COOKIES_EXPIRES });
          resolve(data.data.access_token);
        })
        .catch(error => {
          console.log(error.response);
          resolve(null);
        });
    });
  }

  render() {
    if (!this.state.isInitialized) return null;
    return (
      <BrowserRouter>
        <AuthContext.Provider value={this.state}>
          <MainNavigation />
          <main className="main-content">
            <Switch>
              {this.state.isAuth && <Redirect from="/" to="/user" exact />}
              {this.state.isAuth && <Redirect from="/auth" to="/user" exact />}
              {!this.state.isAuth && <Route path="/auth" component={AuthPage} />}
              {this.state.isAuth && <Route path="/org" component={OrgPage} />}
              {this.state.isAuth && <Route path="/user" component={UserPage} />}
              {this.state.isAuth && <Route path='/dock' component={DockPage} />}
              {!this.state.isAuth && <Redirect from="/" to="/auth" />}
            </Switch>
          </main>
        </AuthContext.Provider>
      </BrowserRouter >
    );
  }
}

export default App;
