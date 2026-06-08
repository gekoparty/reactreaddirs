import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Alert, Box, Snackbar, Stack, TextField, Typography } from "@mui/material";
import PermanentDrawerLeft from "../PermanentDrawerLeft";
import DirectoryTable from "../directoryTable";
import debounce from "lodash.debounce";

const SearchTable = () => {
  const [directories, setDirectories] = useState([]);
  const [filteredDirectories, setFilteredDirectories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [volumeQuery, setVolumeQuery] = useState("");
  const [feedback, setFeedback] = useState(null);

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

  const handleSearch = useMemo(
    () =>
      debounce((query, volume, directoriesList) => {
        const lowerQuery = query.trim().toLowerCase();
        const lowerVolume = volume.trim().toLowerCase();

        const filtered = directoriesList.filter((dir) => {
          const name = dir.name?.toLowerCase() || "";
          const volumeName = dir.volumeName?.toLowerCase() || "";
          const matchesName = !lowerQuery || name.includes(lowerQuery);
          const matchesVolume =
            !lowerVolume || volumeName.includes(lowerVolume);

          return matchesName && matchesVolume;
        });

        const sorted = filtered.sort((a, b) => {
          const volumeA = a.volumeName?.toLowerCase() || "";
          const volumeB = b.volumeName?.toLowerCase() || "";

          if (volumeA < volumeB) return -1;
          if (volumeA > volumeB) return 1;

          const nameA = a.name?.toLowerCase() || "";
          const nameB = b.name?.toLowerCase() || "";

          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;

          return 0;
        });

        setFilteredDirectories(sorted);
      }, 300),
    []
  );

  useEffect(() => {
    handleSearch(searchQuery, volumeQuery, directories);

    return () => {
      handleSearch.cancel();
    };
  }, [searchQuery, volumeQuery, directories, handleSearch]);

  const onChangeSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const onChangeVolumeSearch = (e) => {
    setVolumeQuery(e.target.value);
  };

  const handleDelete = async (selected) => {
    try {
      await axios.post("/api/directories/delete", { ids: selected });

      const updatedDirectories = directories.filter(
        (dir) => !selected.includes(dir._id)
      );

      setDirectories(updatedDirectories);
      setFeedback({
        severity: "success",
        message: `${selected.length} director${selected.length === 1 ? "y" : "ies"} deleted.`,
      });
    } catch (err) {
      console.error("Error deleting directories:", err.message);
      setFeedback({
        severity: "error",
        message: err.response?.data?.error || "Could not delete the selected directories.",
      });
    }
  };

  const handleEdit = async (id, values) => {
    try {
      const response = await axios.put(`/api/directories/${id}`, values);
      const updatedDirectory = response.data.directory;

      setDirectories((current) =>
        current.map((directory) =>
          directory._id === id ? updatedDirectory : directory
        )
      );
      setFeedback({
        severity: "success",
        message: "Directory updated.",
      });
    } catch (err) {
      setFeedback({
        severity: "error",
        message: err.response?.data?.error || "Could not update the directory.",
      });
      throw err;
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
      <PermanentDrawerLeft />
      <Box
        component="main"
        sx={{
          ml: { md: "240px" },
          maxWidth: 1100,
        }}
      >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
        Search database
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Filter folder names inside a specific volume, then edit or remove saved directories.
      </Typography>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 1.5 }}
      >
        <TextField
          label="Folder name"
          variant="outlined"
          value={searchQuery}
          onChange={onChangeSearch}
          sx={{ width: "100%", maxWidth: 520 }}
        />
        <TextField
          label="Volume name"
          variant="outlined"
          value={volumeQuery}
          onChange={onChangeVolumeSearch}
          sx={{ width: "100%", maxWidth: 360 }}
        />
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Showing {filteredDirectories.length} of {directories.length} directories
      </Typography>

      {loading ? (
        <Typography>Loading directories...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <DirectoryTable
          directories={filteredDirectories}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
      </Box>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {feedback && (
          <Alert
            onClose={() => setFeedback(null)}
            severity={feedback.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {feedback.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default SearchTable;
