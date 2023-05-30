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
  Autocomplete,
  TextField,
  Chip,
  Stack,
  CircularProgress,
  List, 
  ListItem, 
  ListItemText
  // IconButton
} from '@mui/material';

import { Settings, Logout } from '@mui/icons-material';

import { performSearch } from '../search/Search';

export default function Topbar() {
  const { user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  // const [searchHistory, setSearchHistory] = useState([]);
  const [searchResponse, setSearchResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);
  // const MAX_SEARCH_HISTORY = 5;

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
  
  const handleSearchProfileClick = (firstName) => {
    handleClose();
    // Navigate to user's profile
    // You can replace the path with your desired URL
    window.location.href = `/profile/${firstName}`;
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
  
  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      console.log('searchValue:', searchValue); // Add this line for debugging
      const trimmedSearchValue = searchValue && searchValue.trim(); // Add null check and trim the value
      console.log('trimmedSearchValue:', trimmedSearchValue); // Add this line for debugging
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

  const handleSearchChange = (event, value) => {
    setSearchValue(value);
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
            id="search-autocomplete"
            className="autocompleteContainer"
            sx={{ width: '100%', borderTopLeftRadius: '30px', borderTopRightRadius: '30px', outline: 'none' }}
            options={searchOptions}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search"
                variant="outlined"
                className="textFieldInput"
                onChange={(event) => handleSearchChange(event, event.target.value)}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading && <ReactLoading type="spin" color="#6200E8" height={'4%'} width={'4%'} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{ width: '100%', top: 0, borderTopLeftRadius: '30px', borderTopRightRadius: '30px', outline: 'none' }}
              />
            )}
            renderOption={(props, option, state) => {
              const { type } = option;
          
              if (loading) {
                return (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ReactLoading type="spin" color="#6200E8" height={'5%'} width={'5%'} />
                    <span>Loading...</span>
                  </div>
                );
              }
          
              if (searchOptions.length === 0 || searchOptions === null) {
                return (
                  <li {...props}>
                    <span>No search results</span>
                  </li>
                );
              } else {
                if (type === 'User') {
                  return (
                    <>
                      <ListItem key={`${option?.indexOf}`} {...props} onClick={() => handleSearchProfileClick(option.firstName)}>
                        <Stack direction="row" alignItems="center">
                          <Avatar
                            src={option?.profilePicture || ''}
                            sx={{ width: 35, height: 35, mt: 0.5, mb: 0.5, mr: 1 }}
                          />
                          <span>{`${option?.firstName} ${option?.lastName}`}</span>
                          <Chip
                            sx={{
                              ml: 1,
                              backgroundColor: '#6309DE',
                              color: '#FFFFFF'
                            }}
                            label={`${option?.type}`}
                            fontSize="small"
                          />
                        </Stack>
                      </ListItem>
                      {option.results && (
                        <>
                          {option.results.map((result) => (
                            <ListItem key={`${result.indexOf}`}>
                              <ListItemText primary={result.reply} />
                            </ListItem>
                          ))}
                          <Divider />
                        </>
                      )}
                    </>
                  );
                }
          
                if (type === 'Post') {
                  return (
                    <>
                      <ListItem key={`${option?.indexOf}`} {...props}>
                        <Stack direction="row" alignItems="center">
                          <span>{`Post content ${option.content}`}</span>
                          <Chip
                            sx={{
                              ml: 1,
                              backgroundColor: '#6309DE',
                              color: '#FFFFFF'
                            }}
                            label={`${option.type}`}
                            fontSize="small"
                          />
                        </Stack>
                      </ListItem>
                      <Divider />
                    </>
                  );
                }
                return null;
              }
            }}
            loading={loading}
            noOptionsText={searchResponse && searchResponse.message ? searchResponse.message : 'No options'}
            loadingText="Loading..."
          />

        </div>

      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          {/* <span className="topbarLink" onClick={handleLogout}>
            Logout
          </span> */}
        </div>
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <Person onClick={handleClick} className="topbarIcon" />
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
        <div >
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

