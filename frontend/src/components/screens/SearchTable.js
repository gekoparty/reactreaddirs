import React, { useEffect, useState } from "react";
import axios from "axios";
import PermanentDrawerLeft from "../PermanentDrawerLeft";
import DirectoryTable from "../DirectoryTable";
import { Box } from "@mui/material"; // Import Box component

const SearchTable = () => {
  const [directories, setDirectories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDirectories = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/directories");
        setDirectories(response.data.directories);
      } catch (err) {
        setError("Error fetching directories: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectories();
  }, []);

  const handleDelete = async (selected) => {
    try {
      console.log("Deleting directories:", selected);
      // Make a request to delete the selected directories on the server
      await axios.post("/api/directories/delete", { ids: selected });

      // Update state to remove deleted directories by _id
      setDirectories(directories.filter((dir) => !selected.includes(dir._id)));
    } catch (err) {
      console.error("Error deleting directories:", err.message);
    }
  };

  return (
   <>
         <Box mt="100px">
   
      <PermanentDrawerLeft />
        {loading ? (
          <p>Loading directories...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <DirectoryTable directories={directories} onDelete={handleDelete}/>
        )}
</Box>
</>
     
  );
};

export default SearchTable;