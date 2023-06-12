import axios from "axios"

export const loginCall = async (userCredential, dispatch) => {
  dispatch({ type: "LOGIN_START" });

  try {
    const res = await axios.post("/api/auth/Login", userCredential);
    const user = res?.data;
    const data = user?.userId;
    const data = user?.userId;
    
    console.log('User=',data)
    fetchUserData(data, dispatch)
  } catch (err) {
    // Dispatch LOGIN_FAILURE action with the error
    dispatch({ type: "LOGIN_FAILURE", payload: err.response.data.error });
  }
};

export const fetchUserData = async (userId, dispatch) => {
  try {
    console.log("Fetching user", userId);
    const res = await axios.get(`/api/users/GETuser/${userId}`);
    const userData = res.data;
    console.log('User=',userData[0])
    // Dispatch action to update user data in the state
    dispatch({ type: "LOGIN_SUCCESS", payload: userData[0] });
  } catch (err) {
    // Handle error
    console.error("Failed to fetch user data:", err);
  }
};

