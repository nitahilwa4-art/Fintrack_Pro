import { User, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'fintrack_users';
const CURRENT_USER_KEY = 'fintrack_session';

// Initialize default admin if not exists
const initAuth = () => {
  const users = getUsers();
  if (users.length === 0) {
    const admin: User = {
      id: 'admin-id',
      name: 'Super Admin',
      email: 'admin@fintrack.com',
      password: 'admin', // Simple password for demo
      role: 'ADMIN',
      createdAt: new Date().toISOString()
    };
    saveUser(admin);
  }
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const login = (email: string, password: string): User | null => {
  initAuth();
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const sessionUser = { ...user };
    delete sessionUser.password; // Don't keep password in session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  }
  return null;
};

export const register = (name: string, email: string, password: string): User | string => {
  initAuth();
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return "Email sudah terdaftar.";
  }

  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    password,
    role: 'USER',
    createdAt: new Date().toISOString()
  };

  saveUser(newUser);
  
  // Auto login
  const sessionUser = { ...newUser };
  delete sessionUser.password;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
  
  return newUser;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(CURRENT_USER_KEY);
  return session ? JSON.parse(session) : null;
};

export const deleteUser = (userId: string) => {
  let users = getUsers();
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};