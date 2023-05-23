import axios from "axios";
import jwtDecode from "jwt-decode";

export const loginCall = async (userCredential, dispatch) => {
  dispatch({ type: "LOGIN_START" });

  try {
    const res = await axios.post("/auth/login", userCredential);
    const { token, user } = res.data;

    // Save JWT to an HTTP-only cookie
    document.cookie = `jwt=${token}; path=/; secure; HttpOnly`;

    // Decode the JWT to extract user data
    const decodedUser = jwtDecode(token);
    console.log('token: ' + JSON.stringify(decodedUser));

    // Dispatch LOGIN_SUCCESS action with the decoded user data
    dispatch({ type: "LOGIN_SUCCESS", payload: user });
  } catch (err) {
    // Dispatch LOGIN_FAILURE action with the error
    dispatch({ type: "LOGIN_FAILURE", payload: err.response.data.error });
  }
};



// Example of fetching additional user data separately
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
