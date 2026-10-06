import React, { useContext, useState } from "react";
import axios from "axios";
import { Alert, Snackbar } from "@mui/material";
import DirectoryTable from "../directoryTable"
import { Store } from "../../store";
import PageLayout from "../PageLayout";

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
    <PageLayout
      eyebrow="This session"
      title="Latest saved"
      subtitle="New directory names saved during the most recent scan."
    >
      <DirectoryTable
        title="Saved names"
        directories={savedDirectories}
        onEdit={handleEdit}
        emptyMessage="No directories have been saved in this session yet."
      />
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
    </PageLayout>
  );
};

export default SavedDirectoryTable;
