import React, { useContext, useState } from "react";
import axios from "axios";
import { Alert, Box, Snackbar, Typography } from "@mui/material";
import DirectoryTable from "../directoryTable"
import PermanentDrawerLeft from "../PermanentDrawerLeft";
import { Store } from "../../store";

const SavedDirectoryTable = () => {
  const { state, dispatch } = useContext(Store);
  const savedDirectories = state.savedDirectories || [];
  const [feedback, setFeedback] = useState(null);

  const handleEdit = async (id, values) => {
    try {
      const response = await axios.put(`/api/directories/${id}`, values);
      const updatedDirectory = response.data.directory;

      const updateById = (directories) =>
        directories.map((directory) =>
          directory._id === id ? updatedDirectory : directory
        );

      dispatch({
        type: "UPDATE_SAVED_DIRECTORIES",
        payload: updateById(savedDirectories),
      });
      dispatch({
        type: "SET_DIRECTORIES",
        payload: updateById(state.directories || []),
      });
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
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: 4,
      }}
    >
      <PermanentDrawerLeft />
      <Box component="main" sx={{ ml: { md: "240px" }, maxWidth: 1100 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Saved directories
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Directories saved during the latest scan.
        </Typography>
        <DirectoryTable directories={savedDirectories} onEdit={handleEdit} />
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

export default SavedDirectoryTable;
