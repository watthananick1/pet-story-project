import { useContext, useEffect, useState } from "react";
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';

const SearchData = ({ options }) => {
  const [searchValue, setSearchValue] = useState('');
  
  
  useEffect(() => {
    const getFriends = async () => {
      try {
        const searchData = await axios.get(`/api/users/friends/${user.member_id}`);
        setSearchValue(friendList.data);
      } catch (err) {
        console.log(err);
      }
    };
    getFriends();
  }, [user]);

  const handleSearchChange = (event, value) => {
    setSearchValue(value);
  };

  return (
    <Stack spacing={2} sx={{ width: 300 }}>
      <Autocomplete
        freeSolo
        id="search-input"
        options={options}
        value={searchValue}
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
