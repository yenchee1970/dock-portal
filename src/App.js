import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';
import MainNavigation from './components/MainNavigation/MainNavigation';
import AuthContext from './contexts/auth-context';
import AuthPage from './pages/Auth';
import Cookies from 'js-cookie';
import Axios from 'axios';
import OrgPage from './pages/Organization';
import UserPage from './pages/User';
import DockPage from './pages/Dock';
import PairPage from './pages/Pair';

const COOKIES_EXPIRES = 10;
const COOKIES_SECURE = false;
const BASE_URL = 'https://dock-api.dyndns.org/v1';

var that;

class App extends Component {
  state = {
    username: null,
    role: null,
    isAuth: false
  }

  isInitialized = false;
  refreshToken = null;
  accessToken = null;

  constructor(props) {
    super(props);
    that = this; // For axios callback use
    this.state.login = this.login;
    this.state.logout = this.logout;
    this.state.clientConn = new Axios.create();
    this.state.clientConn.defaults.baseURL = BASE_URL;
    this.state.clientConn.interceptors.request.use(
      config => {
        const token = that.accessToken;
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
        if (that.refreshToken) {
          const tokens = await that.refresh_token(that.state.username, that.refreshToken);
          that.accessToken = tokens.access_token;
          that.refreshToken = tokens.refresh_token;
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
        .then(tokens => {
          this.isInitialized = true;
          if (tokens) {
            this.accessToken = tokens.access_token;
            this.refreshToken = tokens.refresh_token;
            this.setState({ username: username, isAuth: true, role: tokens.role });
          } else {
            this.accessToken = this.refreshToken = null;
            this.setState({ username: null, isAuth: false });
          }
        });
    } else {
      this.isInitialized = true;
      this.accessToken = this.refreshToken = null;
      this.setState({ username: null, isAuth: false });
    }
  }

  login = (username, accessToken, refreshToken, role) => {
    this.refreshToken = refreshToken;
    this.accessToken = accessToken;
    this.setState({ username: username, isAuth: true, role: role });
    Cookies.set('refresh', refreshToken, { expires: COOKIES_EXPIRES, sameSite: "Strict", secure: COOKIES_SECURE });
    Cookies.set('username', username, { expires: COOKIES_EXPIRES, sameSite: "Strict", secure: COOKIES_SECURE });
  }

  logout = () => {
    this.refreshToken = this.accessToken = null;
    this.setState({ username: null, isAuth: false });
    Cookies.remove('refresh');
    Cookies.remove('username');
  }

  async refresh_token(username, refreshToken) {
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
          console.log("Token refresh ", data);
          Cookies.set("refresh", data.refresh_token, { expires: COOKIES_EXPIRES, sameSite: "Strict", secure: COOKIES_SECURE });
          Cookies.set('username', username, { expires: COOKIES_EXPIRES, sameSite: "Strict", secure: COOKIES_SECURE });
          resolve({ access_token: data.access_token, refresh_token: data.refresh_token, role: data.role });
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
              {this.state.isAuth && <Route path="/dock" component={DockPage} />}
              {this.state.isAuth && <Route path="/pair" component={PairPage} />}
              {!this.state.isAuth && <Redirect from="/" to="/auth" />}
            </Switch>
          </main>
        </AuthContext.Provider>
      </BrowserRouter >
    );
  }
}

export default App;
