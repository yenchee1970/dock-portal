import React from 'react';

export default React.createContext({
    username: null,
    role: null,
    isAuth: false,
    clientConn: null,
    login: (username, accessToken, role) => { },
    logout: () => { }
});