import "./topbar.css";
import {
  Search,
  Person,
  Chat,
  Notifications,
  Settings,
  Logout,
} from "@mui/icons-material";
import { Link, useHistory } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import ReactLoading from "react-loading";
import Cookies from "js-cookie";
import firebase from "firebase/compat/app";
// import "firebase/compat/messaging";

import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { performSearch } from "../search/Search";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();

// const messaging = firebase.messaging();

export default function Topbar() {
  const { user, message: messageUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchOptions, setSearchOptions] = useState([]);
  const [messageata, setSearchOptions] = useState([]);
  const [searchResponse, setSearchResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);
  const history = useHistory();
  const inputRef = useRef(null);
  const token = Cookies.get("token");

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleClose();
    history.push(`/profile/${user?.firstName}`);
  };

  const handleSearchProfileClick = (firstName) => {
    handleClose();
    history.push(`/profile/${firstName}`);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get("/api/auth/logout", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.message); // "Logout successful"
      Cookies.remove("token");
      localStorage.clear();
      window.location.href = `/`;
    } catch (error) {
      console.error(error.response.data.error); // "Logout failed"
    }
    handleClose();
  };

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        let unsubscribeNotification
        const userRef = firestore
        .collection("Notifications")
        .where("member_id", "==", user.member_id);

        unsubscribeNotification = userRef.onSnapshot((userSnapshot) => {
        if (!userSnapshot.empty) {
          userSnapshot.docs.forEach((userDoc) => {
            const userData = userDoc.data();
            setPost((prevPost) => ({
              ...prevPost,
              firstName: userData.firstName,
              lastName: userData.lastName,
              profilePicture: userData.profilePicture,
            }));
          });
        } else {
          // Handle case when no user document matches the query
          console.log("No matching user document found.");
        }
      })
        // Notification.requestPermission().then((permission) => {
        //   if (permission === 'granted') {
        //     console.log('Notification permission granted.');
        //   }
        // })
      } catch (error) {
        console.error("Error getting messaging token:", error);
      }
    };

    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      const trimmedSearchValue = searchValue && searchValue.trim();
      const response = await performSearch(trimmedSearchValue);
      setLoading(false);
      setSearchResponse(response);

      if (response) {
        setSearchOptions(response);
      } else {
        setSearchOptions([]);
      }
    };

    fetchSearchResults();
  }, [searchValue]);

  const handleSearchChange = (event) => {
    const { value } = event.target;
    setSearchValue(value);
    console.log("Search= ", value);
  };

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">Pet Story</span>
        </Link>
      </div>
      <div className="topbarCenter">
        <div className="searchbar">
          <Search className="searchIcon" />
          <Autocomplete
            // Styles for Autocomplete component
            sx={{
              display: "inline-block",
              width: "100%",
              outline: "none",
              "& input": {
                bgcolor: "background.paper",
                color: (theme) =>
                  theme.palette.getContrastText(theme.palette.background.paper),
              },
            }}
            size="small"
            onClick={handleClick}
            id="custom-input"
            loading={loading}
            options={searchOptions}
            getOptionLabel={(option) =>
              `${option.firstName} ${option.lastName}` || option.content || ""
            }
            renderInput={(params) => (
              <>
                <TextField
                  {...params}
                  size="small"
                  variant="standard"
                  sx={{
                    mt: 2,
                    mb: 2,
                    boxShadow: "none",
                    width: "97%",
                    borderRadius: 30,
                    outline: "none",
                    border: "none",
                  }}
                  onChange={handleSearchChange}
                  placeholder="Search"
                />
              </>
            )}
            renderOption={(props, option) => {
              if (option.type === "User") {
                return (
                  <li {...props}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      onClick={() =>
                        handleSearchProfileClick(option?.firstName)
                      }
                    >
                      <Avatar
                        src={`${option.profilePicture}`}
                        sx={{ width: 35, height: 35, mt: 0.5, mb: 0.5, mr: 1 }}
                      />
                      <span>
                        {option?.firstName} {option?.lastName}
                      </span>
                    </Stack>
                  </li>
                );
              }
              if (option.type === "Post") {
                return (
                  <li {...props}>
                    <Stack direction="row" alignItems="center">
                      <span>{`Post ${option.content}`}</span>
                    </Stack>
                  </li>
                );
              }
              return null;
            }}
          />
        </div>
      </div>
      <div className="topbarRight">
        <div className="topbarLinks"></div>
        <div className="topbarIcons">
          <div className="topbarIconItem">
            {/* <Person
              onClick={(event) => setAnchorEl(event.currentTarget)}
              className="topbarIcon"
            /> */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <Avatar
                    aria-label="profile"
                    src={user?.profilePicture}
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                  />
                  Profile
                </ListItemIcon>
              </MenuItem>
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </div>
        </div>
        <div className="topbarIconItem">
          <Link
            to="/messenger"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <Chat className="topbarIcon" />
          </Link>
          <span className="topbarIconBadge">1</span>
        </div>
        <div className="topbarIconItem">
          <Notifications className="topbarIcon" />
          <span className="topbarIconBadge">1</span>
        </div>
        <div>
          <Avatar
            aria-label="profile"
            src={user?.profilePicture}
            sx={{ width: 35, height: 35, mt: 0.5, mb: 0.5 }}
            onClick={(event) => setAnchorEl(event.currentTarget)}
          />
        </div>
      </div>
    </div>
  );
}
