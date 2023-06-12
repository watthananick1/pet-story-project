import axios from "axios";
import fetchUserData from "./context/";

export const loginCall = async (userCredential, dispatch) => {
  dispatch({ type: "LOGIN_START" });

  try {
    const res = await axios.post("/api/auth/Login", userCredential);
    const user = res?.data;
    const data = user?.userId;
    const token = user?.token;

    fetchUserData(data, token, dispatch);
  } catch (err) {
    // Dispatch LOGIN_FAILURE action with the error
    dispatch({ type: "LOGIN_FAILURE", payload: err.response.data.error });
  }
};
