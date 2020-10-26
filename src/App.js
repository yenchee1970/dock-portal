import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';
import MainNavigation from './components/MainNavigation';
import AuthContext from './contexts/auth-context';
import AuthPage from './pages/Auth';
import Cookies from 'js-cookie';
import Axios from 'axios';
import OrgPage from './pages/Organization';
import UserPage from './pages/User';
import DockPage from './pages/Dock';

const COOKIES_EXPIRES = 10;
const BASE_URL = 'https://dock-api.dyndns.org';

var that;

class App extends Component {
  state = {
    refreshToken: null,
    accessToken: null,
    username: null,
    isAuth: false
  }

  isInitialized = false;

  constructor(props) {
    super(props);
    that = this; // For axios callback use
    this.state.login = this.login;
    this.state.logout = this.logout;
    this.state.clientConn = new Axios.create();
    this.state.clientConn.defaults.baseURL = BASE_URL;
    this.state.clientConn.interceptors.request.use(
      config => {
        const token = that.state.accessToken;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        Promise.reject(error)
      });
    this.state.clientConn.interceptors.response.use((response) => {
      return response;
    }, async function (error) {
      let originalRequest = error.config;
      if (error.response.status === 401 && error.response.data.error === "Token expired!" && !originalRequest._retry) {
        originalRequest._retry = true;
        if (that.state.refreshToken) {
          const access_token = await that.refresh_token(that.state.username, that.state.refreshToken);
          that.setState({ accessToken: access_token });
          return that.state.clientConn(originalRequest);
        }
      }
      return Promise.reject(error);
    });
  }

  componentDidMount() {
    let refreshToken = Cookies.get('refresh');
    let username = Cookies.get('username');
    if (refreshToken) {
      this.refresh_token(username, refreshToken)
        .then(access_token => {
          this.isInitialized = true;
          if (access_token) {
            this.setState({
              username: username,
              isAuth: true,
              accessToken: access_token
            });
          }
          else
            this.setState({ refreshToken: null, username: null });
        });
    } else {
      this.isInitialized = true;
      this.setState({ refreshToken: null, username: null });
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

  async refresh_token(username, refreshToken) {
    console.log("Token refreshing")
    return new Promise((resolve, reject) => {
      fetch(BASE_URL + '/client/refresh', {
        method: 'POST',
        body: JSON.stringify({ username: username }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        }
      })
        .then(res => {
          return res.json();
        })
        .then(data => {
          console.log(data);
          that.setState({ refreshToken: data.refresh_token });
          Cookies.set("refresh", data.refresh_token, { expires: COOKIES_EXPIRES });
          Cookies.set('username', username, { expires: COOKIES_EXPIRES });
          resolve(data.access_token);
        })
        .catch(error => {
          console.log(error);
          resolve(null);
        });
    });
  }

  render() {
    if (!this.isInitialized) return null;
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
