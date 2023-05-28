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
  IconButton
} from '@mui/material';

import { Settings, Logout, Delete } from '@mui/icons-material';

import { performSearch } from '../search/Search';

export default function Topbar() {
  const { user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchResponse, setSearchResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);
  const MAX_SEARCH_HISTORY = 5;

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
      const response = await performSearch(searchValue);
      setLoading(false);
      setSearchResponse(response);

      if (response?.results) {
        setSearchOptions(response.results);
      } else {
        setSearchOptions([]);
      }
    };

    fetchSearchResults();
  }, [searchValue]);
  
  
  
  const handleSearchChange = (event, value) => {
    setSearchValue(value);
    // setLoading(true);
  
    // const searchResults = await performSearch(value);
  
    // setSearchHistory((prevHistory) => {
    //   const updatedHistory = [...prevHistory, value].slice(-MAX_SEARCH_HISTORY);
    //   return updatedHistory;
    // });
  
    // // Check if there are search results available
    // if (searchResults && searchResults.length > 0) {
    //   setSearchOptions(searchResults);
    //   setLoading(false);
    // } else {
    //   setSearchOptions([]);
    // }
  };
  

  // const handleSearchChange = async (event) => {
  //   const value = event.target.value;
  //   setSearchValue(value);
  //   const searchResults = await performSearch(value); // Call performSearch with the updated value
  //   // Truncate the search history to a maximum of 5 entries
  //   setSearchHistory((prevHistory) => {
  //     const updatedHistory = [...prevHistory, value].slice(-MAX_SEARCH_HISTORY);
  //     return updatedHistory;
  //   });
    
  //   setSearchOptions([...searchHistory, ...searchResults]);
  // };
  
  // const handleDeleteSearchHistory = (item) => {
  //   setSearchHistory((prevHistory) => prevHistory.filter((historyItem) => historyItem !== item));
  // };
  
  const searchHistoryOptions = Array.from(searchOptions || []);

  return (
  <div className="topbarContainer">
    {/* ... */}
    <div className="topbarCenter">
      <div className="searchbar">
        <Search className="searchIcon" />
        <Autocomplete
          id="search-autocomplete"
          sx={{ width: '100%' }}
          options={searchHistoryOptions}
          getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? (
                      <ReactLoading
                        type="spin"
                        color="#6200E8"
                        height={'5%'}
                        width={'5%'}
                      />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              sx={{ width: '100%' }}
            />
          )}
          // Rest of the props...
        />
      </div>
    </div>
    {/* ... */}
  </div>
);

}

