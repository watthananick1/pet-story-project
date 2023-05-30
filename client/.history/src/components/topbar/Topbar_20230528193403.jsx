import "./topbar.css";
import { Search, Person, Chat, Notifications } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from 'axios';
import ReactLoading from 'react-loading';

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
  ListItemText
} from '@mui/material';
import { Settings, Logout } from '@mui/icons-material';

import { performSearch } from '../search/Search';

export default function Topbar() {
  const { user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchResponse, setSearchResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleClose();
    window.location.href = `/profile/${user?.firstName}`;
  };

  const handleSearchProfileClick = (firstName) => {
    handleClose();
    window.location.href = `/profile/${firstName}`;
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get('/api/auth/logout');
      console.log(response.data.message); // "Logout successful"
      localStorage.clear();
      window.location.href = `/`;
    } catch (error) {
      console.error(error.response.data.error); // "Logout failed"
    }
    handleClose();
  };

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
      <TextField
        className="searchInput"
        variant="outlined"
        placeholder={<><Search/></> Search for friends}
        onChange={handleSearchChange}
        value={searchValue}
      />
        {searchResponse && searchResponse.length > 0 && (
          <div className="searchResultsContainer">
            {searchResponse.map((result) => (
              <Link
                to={`/profile/${result.firstName}`}
                key={result._id}
                className="searchResult"
                onClick={() => handleSearchProfileClick(result.firstName)}
              >
                <Avatar
                  className="searchResultAvatar"
                  alt={result.firstName}
                  src={result.profilePicture}
                />
                <span className="searchResultName">{`${result.firstName} ${result.lastName}`}</span>
                <Chip
                  sx={{
                    ml: 1,
                    backgroundColor: "#6309DE",
                    color: "#FFFFFF",
                  }}
                  label={`${result.type}`}
                  fontSize="small"
                />
              </Link>
            ))}
          </div>
        )}
        {loading && (
          <div className="searchResultsContainer">
            <CircularProgress />
          </div>
        )}
      </div>
      <div className="topbarRight">
        <div className="topbarLinks"></div>
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <Person
              onClick={handleClick}
              className="topbarIcon"
            />
            <Menu
              anchorEl={anchorEl}
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
          <div className="topbarIconItem">
            <Link to="/messenger" style={{ color: 'inherit', textDecoration: 'none' }}>
              <Chat className="topbarIcon" />
            </Link>
            <span className="topbarIconBadge">1</span>
          </div>
          <div className="topbarIconItem">
            <Notifications className="topbarIcon" />
            <span className="topbarIconBadge">2</span>
          </div>
        </div>
        <div>
          <Avatar
            aria-label="profile"
            src={user?.profilePicture}
            sx={{ width: 35, height: 35, mt: 0.5, mb: 0.5 }}
            onClick={handleClick}
          />
        </div>
      </div>
    </div>
  );
}
