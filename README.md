# React Query Auth Hook
This lib is using axios and react-query.
It configures globaly the axios baseURL and the token when necessary.
It handles the user entire journey.
## Installation

```sh
yarn add react-query-auth-hook
```
or
```sh
npm install react-query-auth-hook
```
## Usage
### Configuration
```js
// App.js
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider } from "react-query-auth-hook";

export const queryClient = new QueryClient();

const config = {
  baseURL: "http://localhost:3000",
  tokenKey: "access_token", // The token key in the response
  endpoints: {
    user: "/me", // GET
    login: "/authentication/login", // POST
    register: "/authentication/register", // POST
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider config={config}>
        <MyApp />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### Use it

You can now use the `useAuth` hook in the whole application:
```js
import { useAuth } from "react-query-auth-hook";

const {
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
} = useAuth();
```


