//../search/Search
import axios from "axios";
import Cookies from "js-cookie";

const path = process.env.REACT_APP_PATH_ID;

export const performSearch = async (value) => {
  const token = Cookies.get("token");
  if (value.trim() !== "") {
    try {
      // Perform the search
      //console.log("Searching for:", value);
      // Add your search logic here

      // Example: Make an API request
      const response = await axios.post(
        `${path}/api/search`,
        {
          searchTerm: value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const results = response.data.results;
      console.log("results", results);

      // Combine the search results with the type information and set appropriate labels
      const searchResults = results
        .map((result) => {
          if (result.type === "User") {
            return {
              firstName: result?.firstName,
              lastName: result?.lastName,
              profilePicture: result?.profilePicture,
              type: result?.type,
            };
          } else if (result.type === "Post") {
            // Choose either title or description as the label
            const label = result?.title || result?.description || "No Label";
            return {
              content: result?.content,
              tagpet: result?.tagpet,
              type: result?.type,
              label: label, // Add the label property for rendering in Autocomplete
            };
          }
          return null; // Return null for unrecognized types
        })
        .filter(Boolean); // Remove any null values from the array

      return searchResults;
    } catch (error) {
      console.log(error);
    }
  }
};
