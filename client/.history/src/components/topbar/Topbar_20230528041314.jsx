import "./topbar.css";
import { Search, Person, Chat, Notifications } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from 'axios';

import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Autocomplete,
  TextField,
  Stack
} from '@mui/material';

import { Settings, Logout } from '@mui/icons-material';

export default function Topbar() {
  const { user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const open = Boolean(anchorEl);
  const [users, setUsers] = useState(null);
  const [posts, setPosts] = useState(null);

  // Define the searchOptions array
  const searchOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
    // Add more options as needed
  ];

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

  const handleLogout = async () => {
    try {
      const response = await axios.get('/api/auth/logout');
      console.log(response.data.message);
      localStorage.clear();
      window.location.href = `/`;
    } catch (error) {
      console.error(error.response.data.error);
    }
    handleClose();
  };

  const handleSearchChange = async (event) => {
    const value = event.target.value;
    setSearchValue(value);
    const searchResults = await performSearch(value);

    setUsers(searchResults.filter((result) => result.type === 'User'));
    setPosts(searchResults.filter((result) => result.type === 'Post'));
  };

  const performSearch = async (value) => {
    if (value.trim() !== '') {
      try {
        // Perform the search
        console.log('Searching for:', value);
        // Add your search logic here
  
        // Example: Make an API request
        const response = await axios.post(`/api/search`, { searchTerm: value });
        console.log(response.data);
        const results = response.data.results;
  
        // Combine the search results with the type information
        const searchResults = results.map((result) => ({
          label: result.label,
          type: result.type,
        }));
  
        return searchResults;
      } catch (error) {
        console.log(error);
      }
    }
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
            sx={{
              width: '100%',
              backgroundColor: 'white'
            }}
            freeSolo
            id="search-input"
            options={searchOptions}
            value={searchValue || ''}
            onChange={handleSearchChange}
            renderInput={(params) => (
              <TextField
                sx={{
                  width: '100%',
                  height: '30px',
                  backgroundColor: 'white',
                  borderRadius: '30px',
                  display: 'flex',
                  outline: 'none'
                }}
                {...params}
                label="Search"
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                }}
              />
            )}
            renderOption={(props, option, state) => {
              const { type } = option;
              const { inputValue } = state;
            
              if (type === 'User') {
                return (
                  <>
                    <li {...props}>
                      <Stack direction="row" alignItems="center">
                        <Avatar />
                        <span>{option.label}</span>
                      </Stack>
                    </li>
                    <Divider />
                  </>
                );
              }
            
              if (type === 'Post') {
                return (
                  <>
                    <li {...props}>
                      <span>{option.label}</span>
                    </li>
                    <Divider />
                  </>
                );
              }
            
              return null;
            }}
            
          />
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
            sx={{ width: 35, height: 35, mt: 0.5, mb: 0.5 }}
            onClick={handleClick}
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

