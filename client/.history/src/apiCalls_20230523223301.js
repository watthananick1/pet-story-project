import axios from "axios";
import jwtDecode from "jwt-decode";

export const loginCall = async (userCredential, dispatch) => {
  dispatch({ type: "LOGIN_START" });

  try {
    const res = await axios.post("/api/auth/login", userCredential);
    const user = res?.data;
    const data = user?.user.user
    
    console.log('User=',data)

    // Dispatch LOGIN_SUCCESS action with the decoded user data
    dispatch({ type: "LOGIN_SUCCESS", payload: data });
  } catch (err) {
    // Dispatch LOGIN_FAILURE action with the error
    dispatch({ type: "LOGIN_FAILURE", payload: err.response.data.error });
  }
};



export const fetchUserData = async (userId, dispatch) => {
  try {
    const res = await axios.get(`/users?member_id=${userId}&firstName=`);
    const userData = res.data;

    // Dispatch action to update user data in the state
    dispatch({ type: "UPDATE_USER_DATA", payload: userData });
  } catch (err) {
    // Handle error
    console.error("Failed to fetch user data:", err);
  }
};

