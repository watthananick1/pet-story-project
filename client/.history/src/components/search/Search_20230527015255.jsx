import "./search.css";
import { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';

const SearchData = ({ value }) => {
  const [searchValue, setSearchValue] = useState(value);
  const [searchOptions, setSearchOptions] = useState([]);

  useEffect(() => {
    if (searchValue !== undefined && searchValue !== null) {
      const getSearchData = async () => {
        try {
          const response = await axios.post(`/api/search`, { searchTerm: searchValue });
          console.log(response.data);
          setSearchOptions(response.data);
        } catch (error) {
          console.log(error);
        }
      };
      getSearchData();
    }
  }, [searchValue]);
  
  console.log(searchOptions);

  const handleSearchChange = (event, value) => {
    setSearchValue(value);
  };

  return (
    <Stack spacing={2} sx={{ width: '100%', borderRadius: '30px' }}>
      <div className="searchbar">
        <Autocomplete
          sx={{ width: '100%', height: '30px', borderRadius: '30px', backgroundColor: 'white'}}
          freeSolo
          id="search-input"
          options={[]}
          value={searchValue || ''}
          onChange={handleSearchChange}
          renderInput={(params) => (
            <TextField
              sx={{
                border: 'none',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '30px',
                
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
      </div>
    </Stack>
  );
};

export default SearchData;
