'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContextType, User } from './authContext2';

type ContainerProps = {
  children: React.ReactNode;
};

// Define context and set defaults
const AuthContext = createContext<AuthContextType | null>(null);

axios.defaults.withCredentials = true;

const AuthProvider = (props: ContainerProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate the token with the backend
      axios.post('https://b2b-saas-lead-mangement-3.onrender.com/api/users/validate', {
        withCredentials: true,
      })
        .then(response => {
          setUser(response.data.user);
          setIsLoggedIn(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
        });
    }
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    try {
      const response = await axios.post('https://b2b-saas-lead-mangement-3.onrender.com/api/users/login', credentials, {
        withCredentials: true,
      });
      const userData: User = response.data;
      setUser(userData);
      setIsLoggedIn(true);
      return true; // Return true if login was successful
    } catch (error) {
      console.error('Failed to login', error);
      setUser(null);
      setIsLoggedIn(false);
      return false; // Return false if login failed
    }
  };

  const register = async (credentials2: { email: string; newPassword: string }): Promise<boolean> => {
    try {
      console.log('Registration credentials:', credentials2); // Log credentials

      const response = await axios.post('https://b2b-saas-lead-mangement-3.onrender.com/api/users/register', {
        email: credentials2.email,
        password: credentials2.newPassword, // Ensure correct field name
      });

      // console.log('Registration response:', response.data); // Log response data
      return true;
    } catch (error) {
      console.error('Failed to register', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser, login, register }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
