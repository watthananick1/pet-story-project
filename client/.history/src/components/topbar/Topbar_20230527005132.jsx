import React, { useState } from 'react';
import { Search, Person, Chat, Notifications } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { Avatar, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import { Settings, Logout } from '@mui/icons-material';
import SearchData from "../search/Search";

const Topbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  const open = Boolean(anchorEl);

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
          <input
            placeholder="Search for friend, post or video"
            className="searchInput"
            style={{ backgroundColor: "#fff", color: "#6309DE" }}
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      <div className="topbarRight">
        {/* Remaining code */}
      </div>
    </div>
  );
};

export default Topbar;
