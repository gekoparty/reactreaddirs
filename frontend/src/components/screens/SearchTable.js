import React, { useEffect, useState } from "react";
import axios from "axios";
import PermanentDrawerLeft from "../PermanentDrawerLeft";
import DirectoryTable from "../DirectoryTable";
import { Box, TextField, Button, InputAdornment } from "@mui/material"; // Import Box component
import SearchIcon from "@mui/icons-material/Search"; // Import Search icon

const SearchTable = () => {
  const [directories, setDirectories] = useState([]);
  const [filteredDirectories, setFilteredDirectories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  

  useEffect(() => {
    const fetchDirectories = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/directories");
        setDirectories(response.data.directories);
        setFilteredDirectories(response.data.directories); // Display all by default
      } catch (err) {
        setError("Error fetching directories: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectories();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = directories.filter((dir) =>
      dir.name.toLowerCase().includes(query)
    );
    setFilteredDirectories(filtered);
  };


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
        <Box
          sx={{
            mb: 2,
            display: "flex",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ width: "50%" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      boxShadow: "none",
                      minWidth: "40px",
                    }}
                  >
                    <SearchIcon />
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {loading ? (
          <p>Loading directories...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <DirectoryTable
            directories={filteredDirectories}
            onDelete={handleDelete}
          />
        )}
      </Box>
    </>
  );
};

export default SearchTable;