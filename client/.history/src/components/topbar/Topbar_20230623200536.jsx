import "./topbar.css";
import {
  Search,
  Person,
  Chat,
  Notifications,
  Settings,
  Logout,
  Clear,
} from "@mui/icons-material";
import { Link, useHistory } from "react-router-dom";
import { useContext, useState, useEffect, useRef, Fragment } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import ReactLoading from "react-loading";
import Cookies from "js-cookie";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
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
  IconButton,
  ListItemAvatar,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { performSearch } from "../search/Search";
import { format } from "timeago.js";
import ItemsList from "../listItems/listItems";

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
  const { user, message: messageUser, dispatch } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElNoti, setAnchorElNoti] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchOptions, setSearchOptions] = useState([]);
  const [messageData, setMessageData] = useState([]);
  const [messageDataLength, setMessageDataLength] = useState(null);
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
  const handleClickNoti = () => {
    setAnchorElNoti(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCloseNoti = () => {
    setAnchorElNoti(null);
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
    const unsubscribeNotification = firestore
      .collection("Notifications")
      .where("member_id", "==", user.member_id)
      .onSnapshot((querySnapshot) => {
        const updatedMessageUser = [];
        querySnapshot.forEach((doc) => {
          const notificationData = doc.data();
          const createdAt = new Date(notificationData.timestamp.seconds * 1000);
          const formattedDate = format(createdAt);

          console.log("notificationData", {
            ...notificationData,
            formattedDate,
          });
          updatedMessageUser.push({ ...notificationData, formattedDate });
        });

        dispatch({
          type: "MESSAGE_UPDATE",
          payload: updatedMessageUser,
        });

        setMessageData(updatedMessageUser);
        setMessageDataLength(updatedMessageUser.length);
      });

    return () => {
      // Unsubscribe from the notification listener when the component unmounts
      console.log("Unsubscribed from notification listener", messageData);
      unsubscribeNotification();
    };
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
        <div className="topbarIcons">
          <div className="topbarIconItem">
            {messageData.length > 0 ? (
              <>
              <Menu
                key="noti"
                anchorEl={anchorElNoti}
                open={anchorElNoti}
                onClose={handleCloseNoti}
                sx={{ top: 40 }}
                transformOrigin={{ horizontal: "right", vertical: "bottom" }}
                anchorOrigin={{ horizontal: "right", vertical: "top" }}
              >
                <MenuItem
                    sx={{
                      width: "100%",
                      maxWidth: 360,
                      bgcolor: "background.paper",
                    }}
                    key={index}
                  >
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Fragment>
                            {notification.name}
                            <Typography
                              sx={{ m: 1 }}
                              variant="caption"
                              display="inline"
                              gutterBottom
                            >
                              {notification.formattedDate}
                            </Typography>
                            <IconButton edge="end" aria-label="delete">
                              <Clear fontSize="small" />
                            </IconButton>
                          </Fragment>
                        }
                      />
                    </ListItem>
                    <hr/>
                  </MenuItem>
                {messageData.map((notification, index) => (
                  <MenuItem
                    sx={{
                      width: "100%",
                      maxWidth: 360,
                      bgcolor: "background.paper",
                    }}
                    key={index}
                  >
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar sx={{ width: 35, height: 35 }}>
                        <Avatar
                          alt="Remy Sharp"
                          src={notification.profilePicture}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Fragment>
                            {notification.name}
                            <Typography
                              sx={{ m: 1 }}
                              variant="caption"
                              display="inline"
                              gutterBottom
                            >
                              {notification.formattedDate}
                            </Typography>
                            <IconButton edge="end" aria-label="delete">
                              <Clear fontSize="small" />
                            </IconButton>
                          </Fragment>
                        }
                        secondary={
                          <Fragment>
                            <Typography
                              sx={{ display: "inline" }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {notification.body}-{notification.title}
                            </Typography>
                          </Fragment>
                        }
                      />
                    </ListItem>
                    <hr/>
                  </MenuItem>
                ))}
              </Menu>
              </>
            ) : (
              <Notifications className="topbarIcon" />
            )}
          </div>
        </div>
        <div>
          <IconButton
            key="noti"
            onClick={(event) => handleClickNoti(event.currentTarget)}
          >
            <Notifications className="topbarIcon" />
            <span className="topbarIconBadge">{messageDataLength}</span>
          </IconButton>
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
