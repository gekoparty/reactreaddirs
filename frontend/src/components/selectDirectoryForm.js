import React, { useContext, useState } from "react";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import { Store } from "../store";
import Box from "@mui/material/Box";
import PermanentDrawerLeft from "./PermanentDrawerLeft";
import FormControl from "@mui/material/FormControl";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import DirectoryTable from "./directoryTable";

const SelectDirectoryForm = () => {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const [viewMode, setViewMode] = useState("added");
  const [feedback, setFeedback] = useState(null);

  const resetArrays = () => {
    ctxDispatch({
      type: "RESET_ARRAYS",
      payload: [],
    });
  };

  const fetchDirectories = async (values, { setSubmitting }) => {
    resetArrays();
    try {
      const response = await axios.post("/api/directories", {
        directory: values.directory,
      });

      const updatedDirectories = response.data.directories.map((directory) => ({
        ...directory,
        volumeName: state.volumeName || values.volumeName,
      }));

      ctxDispatch({
        type: "SET_DIRECTORIES",
        payload: updatedDirectories,
      });
      setFeedback({
        severity: "success",
        message: `${updatedDirectories.length} directories found.`,
      });
    } catch (error) {
      console.error("Error fetching directories:", error);
      setFeedback({
        severity: "error",
        message: error.response?.data?.error || "Could not read that directory.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      const response = await axios.post("/api/directories/save", {
        directories: state.directories,
      });
  
      if (response.status === 200) {
        const { savedDirectories, existingDirectories } = response.data;
  
        // Map skipped directories to include current and existing volume information
        const updatedExistingDirectories = existingDirectories.map((dir) => ({
          ...dir,
          volumeName: dir.currentVolume, // The volume just searched
          existingVolume: dir.existingVolume, // The volume it already exists in
        }));
  
        ctxDispatch({
          type: "SET_DIRECTORIES",
          payload: savedDirectories,
        });

        ctxDispatch({
          type: "UPDATE_SAVED_DIRECTORIES",
          payload: savedDirectories,
        });
  
        ctxDispatch({
          type: "SET_EXISTING_DIRECTORIES",
          payload: updatedExistingDirectories,
        });
  
        setFeedback({
          severity: "success",
          message: `${savedDirectories.length} saved, ${updatedExistingDirectories.length} already existed.`,
        });
      } else {
        console.error("Error while saving the directories");
        setFeedback({
          severity: "error",
          message: "Could not save the directories.",
        });
      }
    } catch (error) {
      console.error("Error while saving the directories", error);
      setFeedback({
        severity: "error",
        message: error.response?.data?.error || "Could not save the directories.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id, values) => {
    try {
      const response = await axios.put(`/api/directories/${id}`, values);
      const updatedDirectory = response.data.directory;
      const updateById = (directories) =>
        directories.map((directory) =>
          directory._id === id ? updatedDirectory : directory
        );

      ctxDispatch({
        type: "SET_DIRECTORIES",
        payload: updateById(state.directories),
      });
      ctxDispatch({
        type: "UPDATE_SAVED_DIRECTORIES",
        payload: updateById(state.savedDirectories),
      });
      setFeedback({
        severity: "success",
        message: "Directory updated.",
      });
    } catch (error) {
      setFeedback({
        severity: "error",
        message: error.response?.data?.error || "Could not update the directory.",
      });
      throw error;
    }
  };

  const toggleViewMode = (event, mode) => {
    if (mode) {
      setViewMode(mode);
    }
  };

  const filteredDirectories =
  viewMode === "added"
    ? state.directories
    : state.existingDirectories;
  const canEditVisibleRows =
    viewMode === "added" && filteredDirectories.some((directory) => directory._id);

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
          Add directories
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Scan a folder, attach a volume name, and save new directory names.
        </Typography>

        <Formik
          initialValues={{
            directory: "",
            volumeName: "",
          }}
          onSubmit={fetchDirectories}
        >
          {({ values, handleChange, isSubmitting, setSubmitting }) => (
            <Form>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{ alignItems: { xs: "stretch", md: "flex-start" }, mb: 3 }}
              >
              <FormControl sx={{ minWidth: { md: 220 } }}>
                <InputLabel htmlFor="volumeName"></InputLabel>
                <Field
                  color="warning"
                  size="medium"
                  label="Enter HDD name"
                  id="volumeName"
                  name="volumeName"
                  as={TextField}
                  onChange={(e) => {
                    ctxDispatch({ type: "SET_VOLUME_NAME", payload: e.target.value });
                    handleChange(e);
                  }}
                />
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel htmlFor="directory"></InputLabel>
                <Field
                  color="warning"
                  size="medium"
                  label="Enter directory name"
                  id="directory"
                  name="directory"
                  as={TextField}
                />
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting}
              >
                Submit
              </Button>
              {state.directories.length > 0 && (
                <Button
                  variant="contained"
                  color="warning"
                  type="submit"
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSave(values, { setSubmitting });
                  }}
                >
                  Save
                </Button>
              )}
              </Stack>
            </Form>
          )}
        </Formik>

        <ToggleButtonGroup
          exclusive
          value={viewMode}
          onChange={toggleViewMode}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="added">
            Added
          </ToggleButton>
          <ToggleButton value="skipped">
            Already existed
          </ToggleButton>
        </ToggleButtonGroup>

        <DirectoryTable
          directories={filteredDirectories}
          onEdit={canEditVisibleRows ? handleEdit : undefined}
        />
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

export default SelectDirectoryForm;
