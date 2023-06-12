import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";
import Cookies from "js-cookie";
import axios from "axios";

const INITIAL_STATE = {
  user: null,
  isFetching: false,
  error: false,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  // Use the AuthReducer to handle state updates
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  // Store the user object in localStorage whenever it changes
  useEffect(() => {
    console.log("Store user=", state);
    INITIAL_STATE
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

export const fetchUserData = async (userId, token, dispatch) => {
  try {
    console.log("Fetching user", userId);
    const res = await axios.get(`/api/users/GETuser/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const userData = { ...res.data[0] };
    console.log("UserData=", userData);

    if (token) {
      Cookies.set("token", token, { expires: 1 / 24 }); // Expiration time is in days, so 1 hour is 1/24 of a day
    } else {
      Cookies.remove("token");
    }
    // Dispatch action to update user data in the state
    dispatch({ type: "LOGIN_SUCCESS", payload: userData });
  } catch (err) {
    // Handle error
    console.error("Failed to fetch user data:", err);
  }
};
