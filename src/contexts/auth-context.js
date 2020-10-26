import React from 'react';

export default React.createContext({
    refreshToken: null,
    accessToken: null,
    username: null,
    isAuth: false,
    baseURL: '',
    login: (username, accessToken, refreshToken) => { },
    logout: () => { },
    refresh: () => { },
    isInitialized: false
});