// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ authToken, component: Component, ...rest }) => {
  return authToken ? <Component {...rest} /> : <Navigate to="/login" />;
};

export default PrivateRoute;
