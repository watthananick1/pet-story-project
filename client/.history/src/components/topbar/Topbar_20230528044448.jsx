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

  const handleSearchChange = async (event) => {
    const value = event.target.value;
    setSearchValue(value);
    const searchResults = await performSearch(value); // Call performSearch with the updated value

    // setUsers(searchResults.filter((result) => result.type === 'User'));
    // setPosts(searchResults.filter((result) => result.type === 'Post'));
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
  
        // Combine the search results with the type information and set appropriate labels
        const searchResults = results.map((result) => {
          if (result.type === 'User') {
            return {
              label: result?.firstName + ' ' + result?.lastName,
              type: result?.type,
            };
          } else if (result.type === 'Post') {
            // Choose either content or tagpet as the label
            const label = result?.content || result?.tagpet[0] || 'No Label';
            return {
              label: label,
              type: result.type,
            };
          }
          return null; // Return null for unrecognized types
        });
  
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
          <span className="logo">Social Media</span>
        </Link>
      </div>
      <div className="topbarCenter">
        <div className="searchbar">
          <Search className="searchIcon" />
          <Autocomplete
            id="search-autocomplete"
            freeSolo
            sx={{ width: '100%' }}
            options={searchOptions}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  sx: { width: '100%' },
                  type: 'search',
                }}
              />
            )}
            // renderOption={(props, option, state) => {
            //   const { type } = option;
            //   const { inputValue } = state;
          
            //   if (type === 'User') {
            //     const { username, avatarUrl } = option;
          
            //     return (
            //       <>
            //         <li {...props}>
            //           <Stack direction="row" alignItems="center">
            //             <Avatar src={avatarUrl} />
            //             <span>{username}</span>
            //           </Stack>
            //         </li>
            //         <Divider />
            //       </>
            //     );
            //   }
          
            //   if (type === 'Post') {
            //     const { title, description } = option;
          
            //     return (
            //       <>
            //         <li {...props}>
            //           <div>
            //             <span>{title}</span>
            //             <p>{description}</p>
            //           </div>
            //         </li>
            //         <Divider />
            //       </>
            //     );
            //   }
          
            //   return null;
            // }}
          />
        </div>
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          <span className="topbarLink" onClick={handleLogout}>
            Logout
          </span>
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
        <Link to={`/profile/${user?.username}`}>
          <img
            src={user?.profilePicture || "/assets/person/noAvatar.png"}
            alt=""
            className="topbarImg"
          />
        </Link>
      </div>
    </div>
  );
  
}
