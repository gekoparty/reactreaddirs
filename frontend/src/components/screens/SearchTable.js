import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, TextField, Typography } from "@mui/material";
import PermanentDrawerLeft from "../PermanentDrawerLeft";
import DirectoryTable from "../DirectoryTable";
import debounce from "lodash.debounce";

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
        setFilteredDirectories(response.data.directories);
      } catch (err) {
        setError("Error fetching directories: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectories();
  }, []);

  const handleSearch = debounce((query) => {
    const lowerQuery = query.toLowerCase();
    setFilteredDirectories(
      directories.filter((dir) => dir.name.toLowerCase().includes(lowerQuery))
    );
  }, 300);

  const onChangeSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleDelete = async (selected) => {
    try {
      await axios.post("/api/directories/delete", { ids: selected });
      setDirectories(directories.filter((dir) => !selected.includes(dir._id)));
      setFilteredDirectories(
        filteredDirectories.filter((dir) => !selected.includes(dir._id))
      );
    } catch (err) {
      console.error("Error deleting directories:", err.message);
    }
  };

  return (
    <Box sx={{ mt: 10, px: 3 }}>
      <PermanentDrawerLeft />
      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
        <TextField
          label="Search Directories"
          variant="outlined"
          value={searchQuery}
          onChange={onChangeSearch}
          sx={{ width: "50%" }}
        />
      </Box>

      {loading ? (
        <Typography>Loading directories...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <DirectoryTable
          directories={filteredDirectories}
          onDelete={handleDelete}
        />
      )}
    </Box>
  );
};

export default SearchTable;
