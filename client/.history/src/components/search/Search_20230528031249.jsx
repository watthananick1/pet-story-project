import "./search.css";
import { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';

const SearchData = ({ value, onEvent }) => {
  const [searchValue, setSearchValue] = useState(value);
  const [searchOptions, setSearchOptions] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue.trim() !== '') {
        performSearch(searchValue);
      }
    }, 500); // Adjust the debounce delay as per your preference (in milliseconds)

    return () => {
      clearTimeout(timer);
    };
  }, [searchValue]);

  const performSearch = async (value) => {
    try {
      const response = await axios.post(`/api/search`, { searchTerm: value });
      setSearchOptions(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchChange = (event, value) => {
    setSearchValue(value);
    onEvent(event); // Call the onEvent callback with the updated search value
  };

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Autocomplete
        sx={{
          width: '100%',
          backgroundColor: 'white'
        }}
        freeSolo
        id="search-input"
        options={searchOptions} // Pass the searchOptions state variable
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
      />
    </Stack>
  );
};

export default SearchData;
