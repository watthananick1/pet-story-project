import axios from 'axios';

export const performSearch = async (value) => {
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
            firstName: result?.firstName,
            lastName: result?.lastName,
            profilePicture: result?.profilePicture,
            type: result?.type,
          };
        } else if (result.type === 'Post') {
          // Choose either title or description as the label
          const label = result?.title || result?.description || 'No Label';
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