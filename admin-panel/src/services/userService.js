import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users/';

const getUsers = () => {
  return axios.get(API_URL);
};

const createUser = (user) => {
  return axios.post(API_URL, user);
};

const deleteUser = (id) => {
  return axios.delete(API_URL + id);
};

const userService = {
  getUsers,
  createUser,
  deleteUser,
};

export default userService;
