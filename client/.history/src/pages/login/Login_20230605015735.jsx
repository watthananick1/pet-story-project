import { useState, useContext, useRef } from "react";
import "./login.css";
import { loginCall } from "../../apiCalls";
import { AuthContext } from "../../context/AuthContext";
import { CircularProgress } from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import { useHistory } from "react-router";

export default function Login() {
  const email = useRef();
  const password = useRef();
  const history = useHistory();
  const { isFetching, dispatch } = useContext(AuthContext);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await loginCall(
        { email: email.current.value, password: password.current.value },
        dispatch
      );
      history.push("/"); // Redirect to home page after successful login
    } catch (error) {
      console.error("Login failed:", error);
      // Handle login failure, show error message, etc.
    }
  };
  
  const handleClickCreate = (e) => {
    e.preventDefault();
    history.push('/register')
  }
 
  return (
      
    // <div className="login" style={{ backgroundColor: "#E2D7F0" }}>
    //   <div className="loginWrapper">
    //     <div className="loginLeft">
    //       <h3 className="loginLogo" style={{ color: "#6309de" }}>Pet Story</h3>
    //       <span className="loginDesc"></span>
    //     </div>
    //     <div className="loginRight">
    //       <form className="loginBox" onSubmit={handleClick}>
    //         <input
    //           placeholder="Email"
    //           type="email"
    //           required
    //           className="loginInput"
    //           ref={email}
    //         />
    //         <div className="passwordContainer">
    //           <input
    //             placeholder="Password"
    //             type={passwordVisible ? "text" : "password"}
    //             required
    //             minLength="6"
    //             className="loginInput"
    //             ref={password}
    //           />
    //           {passwordVisible ? (
    //             <VisibilityOffIcon
    //               className="passwordVisibilityIcon"
    //               onClick={() => setPasswordVisible(false)}
    //             />
    //           ) : (
    //             <VisibilityIcon
    //               className="passwordVisibilityIcon"
    //               onClick={() => setPasswordVisible(true)}
    //             />
    //           )}
    //         </div>

    //         <button className="loginButton" type="submit" disabled={isFetching} style={{ backgroundColor: "#6309de" }} >
    //           {isFetching ? (
    //             <CircularProgress color="white" size="20px" />
    //           ) : (
    //             "Log In"
    //           )}
    //         </button>
    //         <span className="loginForgot">Forgot Password?</span>
    //         <button className="loginRegisterButton" onClick={handleClickCreate}>
    //           {isFetching ? (
    //             <CircularProgress color="white" size="20px" />
    //           ) : (
    //             "Create a New Account"
    //           )}
    //         </button>
    //       </form>
    //     </div>
    //   </div>
    // </div>
  );
}
