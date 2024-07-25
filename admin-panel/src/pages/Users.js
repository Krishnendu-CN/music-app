// src/pages/Users.js
import React, { useEffect, useState } from 'react';
import API from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get('/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
