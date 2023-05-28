import "./search.css";
import { useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';

const SearchData = ({ value, event }) => {
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
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Autocomplete
        sx={{
          width: '100%',
          backgroundColor: 'white'
        }}
        freeSolo
        id="search-input"
        options={[]}
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
