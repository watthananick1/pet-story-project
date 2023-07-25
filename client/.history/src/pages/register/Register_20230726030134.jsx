import { useState, useRef } from "react";
import "./register.css";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useHistory } from "react-router";
import axios from "axios";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Card from "@mui/material/Card";

const path = process.env.REACT_APP_PATH_ID;

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="">
        Pet story
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

function Register() {
  const history = useHistory();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [ConfirmVisible, setConfirmVisible] = useState(false);

  const handleClickShowPassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleClickShowConfirm = () => {
    setConfirmVisible(!ConfirmVisible);
  };
  
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (confirmPassword.current.value !== password) {
      confirmPassword.current.setCustomValidity("Passwords don't match!");
    } else {
      const user = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        dateOfBirth: dateOfBirth,
        status: "active",
        followers: [],
        followings: [],
        statusUser: "USER",
        typePets: [],
        profilePicture: "",
        coverPicture: "",
      };
      try {
        const res = await axios.post(`${path}/api/auth/register`, user);
        if (res.status === 200) {
          localStorage.setItem("Uid", res.data.member_id);
          history.push({
            pathname: "/typepet",
            state: res.data.member_id, // pass the user object as a prop
          }); // redirect to the TypePet page
        } else {
          console.log("Registration failed. Status:", res.status);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleDateOfBirthChange = (event) => {
    setDateOfBirth(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const theme = createTheme();

  return (
    <div className="login">
      <div className="loginWrapper">
        <ThemeProvider theme={theme}>
          <Grid container component="main">
            <CssBaseline />
            <Grid
              item
              xs={false}
              sm={4}
              md={7}
              sx={{
                backgroundImage:
                  "url(https://firebasestorage.googleapis.com/v0/b/pet-story-f51e3.appspot.com/o/mainData%2FloginImage1.jpg?alt=media&token=4547e22e-e032-4eb9-82fa-84551789d27e)",
                backgroundRepeat: "no-repeat",
                backgroundColor: (t) =>
                  t.palette.mode === "light"
                    ? t.palette.grey[50]
                    : t.palette.grey[900],
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            />
            <Grid
              item
              xs={12}
              sm={8}
              md={5}
              component={Paper}
              elevation={6}
              square
            >
              <Box
                sx={{
                  my: 8,
                  mx: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                </Avatar>
                <Typography component="h1" variant="h5">
                  Register
                </Typography>
                <Box
                  component="form"
                  noValidate
                  onSubmit={handleSubmit}
                  sx={{ mt: 2 }}
                >
                  <TextField
                    sx={{ mb: 2 }}
                    autoComplete="fname"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    value={firstName}
                    onChange={handleFirstNameChange}
                  />
                  <TextField
                    sx={{ mb: 2 }}
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="lname"
                    value={lastName}
                    onChange={handleLastNameChange}
                  />
                  <TextField
                    sx={{ mb: 2 }}
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                  />
                  <TextField
                    sx={{ mb: 2 }}
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={passwordVisible ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            edge="end"
                          >
                            {passwordVisible ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    sx={{ mb: 2 }}
                    required
                    fullWidth
                    id="confirmPassword"
                    label="Confirm Password"
                    name="confirmPassword"
                    type={ConfirmVisible ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowConfirm}
                            edge="end"
                          >
                            {ConfirmVisible ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    required
                    fullWidth
                    id="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    name="dateOfBirth"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={dateOfBirth}
                    onChange={handleDateOfBirthChange}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Sign In
                  </Button>
                  <Grid container justifyContent="flex-end">
                    <Grid item>
                      <Link href="/login" variant="body2">
                        Already have an account? Sign in
                      </Link>
                    </Grid>
                  </Grid>
                  <Copyright sx={{ mt: 5 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </ThemeProvider>
      </div>
    </div>
  );
}

export default Register;
