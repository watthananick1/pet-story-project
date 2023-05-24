import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";

const INITIAL_STATE = {
  user: JSON.parse(localStorage?.getItem("user")) || null,
  isFetching: false,
  error: false,
};



export const AuthContext = createContext(INITIAL_STATE);


export const AuthContextProvider = ({ children }) => {
  // Use the AuthReducer to handle state updates
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  // Store the user object in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  // Provide the authentication context with the current state and dispatch function
  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isFetching: state.isFetching,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

