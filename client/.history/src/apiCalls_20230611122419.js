import axios from "axios";
import {fetchUserData}

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

export const fetchUserData = async (userId, token, dispatch) => {
  try {
    console.log("Fetching user", userId);
    const res = await axios.get(`/api/users/GETuser/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const userData = { ...res.data[0], token: token };
    console.log("UserData=", userData);
    // Dispatch action to update user data in the state
    dispatch({ type: "LOGIN_SUCCESS", payload: userData });
  } catch (err) {
    // Handle error
    console.error("Failed to fetch user data:", err);
  }
};
