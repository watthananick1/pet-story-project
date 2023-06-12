import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";
import Cookies from 'js-cookie';

// const userFromLocalStorage = localStorage.getItem("user");
// const parsedUser = userFromLocalStorage ? JSON.parse(userFromLocalStorage) : null;

const INITIAL_STATE = {
  user: parsedUser,
  isFetching: false,
  error: false,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  // Use the AuthReducer to handle state updates
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  // Store the user object in localStorage whenever it changes
  useEffect(() => {
    console.log('Store user=', state);
    localStorage.setItem("user", JSON.stringify(state.user));
    if (state.user && state.user.token) {
      Cookies.set("token", state.user.token, { expires: 1 / 24 }); // Expiration time is in days, so 1 hour is 1/24 of a day
    } else {
      Cookies.remove("token");
    }
  }, [state]);

  // Provide the authentication context with the current state and dispatch function
  return (
    <AuthContext.Provider
      value={{
        user: state?.user,
        isFetching: state?.isFetching,
        error: state?.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
