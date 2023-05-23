import axios from "axios";
import { useRef } from "react";
import "./register.css";
import { useHistory } from "react-router";

export default function Register() {
  const firstName = useRef();
  const lastName = useRef();
  const email = useRef();
  const password = useRef(); 
  const confirmPassword = useRef();
  const dateOfBirth = useRef();
  const history = useHistory();

  const handleClick = async (e) => {
    e.preventDefault();
    if (confirmPassword.current.value !== password.current.value) {
      confirmPassword.current.setCustomValidity("Passwords don't match!");
    } else {
      const user = {
        firstName: firstName.current.value,
        lastName: lastName.current.value,
        email: email.current.value,
        password: password.current.value,
        dateOfBirth: dateOfBirth.current.value,
        status: "active",
        followers: [],
        followings: [],
        statusUser: "USER",
        typePets: [],
        profilePicture: "",
        coverPicture: ""
      };
      try {
        const res = await axios.post("/api/auth/register", user);
        localStorage.setItem('Uid', res.member_id);
        history.push({
          pathname: "/typepet",
          state: res.member_id  // pass the user object as a prop
        }); // redirect to the TypePet page
      } catch (err) {
        console.log(err);
      }
    }
  };
  
  return (
    <div className="login" style={{ backgroundColor: "#E2D7F0" }}>
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo" style={{ color: "#6309de" }}>Pet Story</h3>
          <span className="loginDesc"></span>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={handleClick}>
            
            <input
              placeholder="First Name"
              required
              ref={firstName}
              className="loginInput"
            />
            <input
              placeholder="Last Name"
              required
              ref={lastName}
              className="loginInput"
            />
            <input
              placeholder="Email"
              required
              ref={email}
              className="loginInput"
              type="email"
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            />

            <input
              placeholder="Password"
              required
              ref={password}
              className="loginInput"
              type="password"
              minLength="6"
            />
            <input
              placeholder="Confirm Password"
              required
              ref={confirmPassword}
              className="loginInput"
              type="password"
            />
            <input
              placeholder="Date of Birth (DD-MM-YYYY)"
              required
              ref={dateOfBirth}
              className="loginInput"
              type="date"
            />
            <button className="loginButton" type="submit" style={{ backgroundColor: "#6309de" }}>
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
