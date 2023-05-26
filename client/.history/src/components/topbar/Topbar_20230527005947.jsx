import "./topbar.css";
import { Search, Person, Chat, Notifications } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from 'axios';
import SearchData from "../search/Search";

import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';

import { Settings, Logout } from '@mui/icons-material';

export default function Topbar() {
  const { user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const open = Boolean(anchorEl);
  // const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleProfileClick = () => {
    handleClose();
    // Navigate to user's profile
    // You can replace the path with your desired URL
    window.location.href = `/profile/${user?.firstName}`;
  };
  const handleLogout = async () => {
    try {
      // Make a GET request to the /logout endpoint
      const response = await axios.get('/api/auth/logout');
      // Handle successful logout
      console.log(response.data.message); // "Logout successful"
      // Perform any additional actions after logout
      localStorage.clear();
      window.location.href = `/`;
    } catch (error) {
      // Handle logout failure
      console.error(error.response.data.error); // "Logout failed"
      // Perform any additional error handling
    }
    handleClose();
  };
  
  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
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
          <SearchData options={[]} value={searchValue} onChange={handleSearchChange} />
        </div>
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          <span className="topbarLink">Homepage</span>
          <span className="topbarLink">Timeline</span>
        </div>
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <Person />
            <span className="topbarIconBadge">1</span>
          </div>
          <div className="topbarIconItem">
            <Chat />
            <span className="topbarIconBadge">2</span>
          </div>
          <div className="topbarIconItem">
            <Notifications />
            <span className="topbarIconBadge">1</span>
          </div>
        </div>
        <div>
          <Avatar
            aria-label="profile"
            src={user?.profilePicture}
            sx={{ width: 35, height: 35,  mt: 0.5, mb: 0.5,}}
            onClick={handleClick} // Added event handler
          />
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileClick}>
              <span>
                <Avatar /> 
                <span>Profile</span>
              </span>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <span>Settings</span>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <span>Logout</span>
            </MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
  
}
