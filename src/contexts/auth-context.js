import React from 'react';

export default React.createContext({
    refreshToken: null,
    accessToken: null,
    username: null,
    isAuth: false,
    clientConn: null,
    login: (username, accessToken, refreshToken) => { },
    logout: () => { }
});