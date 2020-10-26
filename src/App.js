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

class App extends Component {
  state = {
    accessToken: null,
    refreshToken: null,
    username: null,
    isAuth: false,
    baseURL: '',
    isInitialized: false
  }

  constructor(props) {
    super(props);
    this.state.baseURL = 'https://dock-api.dyndns.org';
  }

  componentDidMount() {
    let refreshToken = Cookies.get('refresh');
    let username = Cookies.get('username');
    if (refreshToken) {
      this.refresh(username, refreshToken)
        .then(accessToken => {
          this.setState({
            refreshToken: refreshToken,
             username: username, 
             isInitialized: true,
             isAuth: true,
             accessToken: accessToken,
            });
        });
    } else
      this.setState({refreshToken: null, username: null, isInitialized: true});
  }

  login = (username, accessToken, refreshToken) => {
    this.setState({ username: username, accessToken: accessToken, refreshToken: refreshToken, isAuth: true });
    Cookies.set('refresh', refreshToken, { expires: 1 });
    Cookies.set('username', username, { expires: 1 });
  }

  logout = () => {
    this.setState({ username: null, accessToken: null, refreshToken: null, isAuth: false });
    Cookies.remove('refresh');
    Cookies.remove('username');
  }

  refresh(username, refreshToken) {
    return new Promise((resolve, reject) => {
      axios.post(this.state.baseURL + '/client/refresh', { username: username }, { headers: { 'Authorization': `Bearer ${refreshToken}` } })
        .then(data => {
          console.log(data.data);
          resolve(data.data.access_token);
        })
        .catch(error => {
          console.log(error.response);
          resolve(null);
        });
    });
  }

  render() {
    console.log(this.state.isAuth);
    if (!this.state.isInitialized) return null;
    return (
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            accessToken: this.state.accessToken,
            refreshToken: this.state.refreshToken,
            username: this.state.username,
            isAuth: this.state.username,
            baseURL: this.state.baseURL,
            login: this.login,
            logout: this.logout
          }}>
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
