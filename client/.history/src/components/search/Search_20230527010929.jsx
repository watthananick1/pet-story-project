import { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';

const SearchData = ({ options }) => {
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (options !== undefined || options !== null) {
      const getSearchData = async () => {
        try {
          const response = await axios.post(`/api/search`, { searchTerm: options });
          setSearchValue(response.data);
        } catch (error) {
          console.log(error);
        }
      };
      getSearchData();
    }

  }, [options]);

  const handleSearchChange = (event, value) => {
    setSearchValue(value);
  };

  return (
    <Stack spacing={2} sx={{ width: 300 }}>
      <Autocomplete
        freeSolo
        id="search-input"
        options={options}
        value={{searchValue ? searchValue : ''}}
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
