import React, { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

interface Endpoints {
  user: string;
  login: string;
  register: string;
}

interface Config {
  baseURL: string;
  tokenKey: string;
  endpoints: Endpoints;
}

interface AuthProviderProps {
  config: Config;
  children: React.ReactNode;
}

export const setToken = (token: string) => {
  console.log(token);
  SecureStore.setItemAsync("token", token);
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const initToken = async () => {
  const token = await SecureStore.getItemAsync("token");
  if (!token) {
    return false;
  }
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return true;
};

export const clearToken = async () => {
  axios.defaults.headers.common["Authorization"] = undefined;
  await SecureStore.deleteItemAsync("token");
};

const AuthContext = createContext(null);

export const AuthProvider = ({ config, children } : AuthProviderProps) : React.ReactNode => {
  const queryClient = useQueryClient();

  const [appIsLoaded, setAppIsLoaded] = useState(false);
  const { data: user } = useQuery("user", () =>
    axios.get(config.endpoints.user)
  );

  const loadApp = async () => {
    let response;
    await initToken();
    try {
      response = await axios.get(config.endpoints.user);
    } catch (e) {};
    queryClient.setQueryData("user", response);
    setAppIsLoaded(true);
  };

  useEffect(() => {
    axios.defaults.baseURL = config.baseURL;
    loadApp();
  }, []);

  const logout = () => {
    clearToken();
    queryClient.setQueryData("user", null);
  };

  const {
    mutate: login,
    error: loginError,
    isError: loginIsError,
    isLoading: loginIsLoading,
    isSuccess: loginIsSuccess,
  } = useMutation((params) => axios.post(config.endpoints.login, params), {
    onSuccess: ({ data }) => {
      setToken(data[config.tokenKey]);
      queryClient.invalidateQueries("user");
    },
  });

  const {
    mutate: register,
    error: registerError,
    isError: registerIsError,
    isLoading: registerIsLoading,
    isSuccess: registerIsSuccess,
  } = useMutation((params) => axios.post(config.endpoints.register, params), {
    onSuccess: ({ data }) => {
      setToken(data[config.tokenKey]);
      queryClient.invalidateQueries("user");
    },
  });

  return (
    <AuthContext.Provider
      value={{
        login,
        loginIsError,
        loginIsLoading,
        loginIsSuccess,
        loginError,
        register,
        registerIsError,
        registerIsLoading,
        registerIsSuccess,
        registerError,
        isLoggedIn: !!user,
        user,
        logout,
        appIsLoaded,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () : {
  login: Function,
  loginIsError: Boolean,
  loginIsLoading: Boolean,
  loginIsSuccess: Boolean,
  loginError: any,
  register: Function,
  registerIsError: Boolean,
  registerIsLoading: Boolean,
  registerIsSuccess: Boolean,
  registerError: any,
  isLoggedIn: Boolean,
  user: any,
  logout: Function,
  appIsLoaded: Boolean,
} => {
  const context = useContext(AuthContext);
    if (!context) {
      throw new Error(`useAuth must be used within an AuthProvider`);
    }
    return context;
}
