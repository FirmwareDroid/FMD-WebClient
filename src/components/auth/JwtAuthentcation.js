import {Cookies} from 'react-cookie';

export const getAccessToken = () => Cookies.get('sessionid')
export const getRefreshToken = () => Cookies.get('refresh_token')
export const isAuthenticated = () => !!getAccessToken()