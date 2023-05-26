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
          const response = await axios.post(`/api/search`, { searchTerm: value });
          setSearchOptions(response.data);
        } catch (error) {
          console.log(error);
        }
      };
      getSearchData();
    }
  }, [searchValue]);

  const handleSearchChange = (event, value) => {
    setSearchValue(value);
  };

  return (
    <Stack spacing={2} sx={{ width: 300 }}>
      <Autocomplete
        freeSolo
        id="search-input"
        options={searchOptions || []}
        value={searchValue || 'Search'}
        onChange={handleSearchChange}
        renderInput={(params) => (
          <TextField
            
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
