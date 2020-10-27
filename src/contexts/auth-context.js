import React from 'react';

export default React.createContext({
    username: null,
    isAuth: false,
    clientConn: null,
    login: (username, accessToken, refreshToken) => { },
    logout: () => { }
});