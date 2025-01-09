import React, { useContext, useState } from "react";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import { Link } from "react-router-dom";
import { Store } from "../store";
import Box from "@mui/material/Box";
import PermanentDrawerLeft from "./PermanentDrawerLeft";

import FormControl from "@mui/material/FormControl";

import DirectoryTable from "./DirectoryTable";

const SelectDirectoryForm = () => {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const [viewMode, setViewMode] = useState("added"); // Track view mode: "added" or "skipped"

  const resetArrays = () => {
    ctxDispatch({
      type: "RESET_ARRAYS",
      payload: [],
    });
  };

  const fetchDirectories = async (values, { setSubmitting }) => {
    resetArrays();
    try {
      const response = await axios.post("api/directories", {
        directory: values.directory,
      });

      const updatedDirectories = response.data.directories.map((directory) => ({
        ...directory,
        volumeName: state.volumeName || values.volumeName,
      }));

      console.log("Updated directories with volumeName:", updatedDirectories);

      ctxDispatch({
        type: "SET_DIRECTORIES",
        payload: updatedDirectories,
      });
    } catch (error) {
      console.error("Error fetching directories:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      const response = await axios.post("api/directories/save", {
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
  
        // Dispatch both saved and updated skipped directories
        ctxDispatch({
          type: "SET_DIRECTORIES",
          payload: savedDirectories,
        });
  
        ctxDispatch({
          type: "SET_EXISTING_DIRECTORIES",
          payload: updatedExistingDirectories,
        });
  
        console.log("Directories saved successfully.");
      } else {
        console.error("Error while saving the directories");
      }
    } catch (error) {
      console.error("Error while saving the directories", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle between viewing added and skipped directories
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // Filter directories based on the selected view mode
  const filteredDirectories =
  viewMode === "added"
    ? state.directories // Show only added directories
    : state.existingDirectories; // Show only skipped directories

  return (
    <>
      <Box mt="100px">
        {state.savedDirectories.length > 0 && (
          <Button variant="outlined" color="error">
            <Link style={{ textDecoration: "none" }} to="/saved-directories">
              Saved Directories
            </Link>
          </Button>
        )}
        {state.existingDirectories.length > 0 && (
          <Button variant="outlined" color="error">
            <Link style={{ textDecoration: "none" }} to="/existing-directories">
              Existing Directories
            </Link>
          </Button>
        )}

        <PermanentDrawerLeft />
        <Formik
          initialValues={{
            directory: "",
            volumeName: "",
          }}
          onSubmit={fetchDirectories}
        >
          {({ values, handleChange, isSubmitting, setSubmitting }) => (
            <Form style={{ marginTop: "10px" }}>
              <FormControl>
                <InputLabel htmlFor="volumeName"></InputLabel>
                <Field
                  color="warning"
                  size="small"
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
              <FormControl>
                <InputLabel htmlFor="directory"></InputLabel>
                <Field
                  color="warning"
                  size="small"
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
                  style={{ marginLeft: "10px" }}
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
            </Form>
          )}
        </Formik>

        {/* Buttons to toggle views */}
        <Box mt="20px">
          <Button
            variant={viewMode === "added" ? "contained" : "outlined"}
            color="primary"
            onClick={() => toggleViewMode("added")}
          >
            Show Added
          </Button>
          <Button
            variant={viewMode === "skipped" ? "contained" : "outlined"}
            color="secondary"
            onClick={() => toggleViewMode("skipped")}
          >
            Show Skipped
          </Button>
        </Box>

        {/* DirectoryTable displaying filtered directories */}
        <DirectoryTable directories={filteredDirectories} />
      </Box>
    </>
  );
};

export default SelectDirectoryForm;