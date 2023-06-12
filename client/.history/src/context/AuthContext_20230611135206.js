import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";
import Cookies from "js-cookie";
import axios from "axios";
const dataUser = Cookies.set("user") || null;

const INITIAL_STATE = {
  user: dataUser,
  isFetching: false,
  error: false,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  // Use the AuthReducer to handle state updates
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  // Store the user object in localStorage whenever it changes
  useEffect(() => {
    console.log("Store user=", state.user);
    localStorage.setItem("user", JSON.stringify(state.user));
    if (state.user && state.user.token) {
      Cookies.set("token", state.user.token, { expires: 1 / 24 });
      Cookies.set("user", state.user, { expires: 1 / 24 });
    } else {
      Cookies.remove("token");
      Cookies.remove("user");
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
    // Dispatch action to update user data in the state
    dispatch({ type: "LOGIN_SUCCESS", payload: userData });
  } catch (err) {
    // Handle error
    console.error("Failed to fetch user data:", err);
  }
};
