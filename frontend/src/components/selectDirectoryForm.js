import React, { useContext } from "react";
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
  
      // Add volumeName to each directory
      const updatedDirectories = response.data.directories.map((directory) => ({
        ...directory,
        volumeName: state.volumeName || values.volumeName, // Attach volumeName
      }));
  
      // Log the updated directories for debugging
      console.log("Updated directories with volumeName:", updatedDirectories);
  
      // Dispatch the updated directories
      ctxDispatch({
        type: "SET_DIRECTORIES",
        payload: updatedDirectories, // Pass the updated directories
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
        directories: state.directories, // Each directory already includes volumeName
      });
  
      if (response.status === 200) {
        ctxDispatch({
          type: "SET_DIRECTORIES",
          payload: response.data.savedDirectories, // Update saved directories
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
    volumeName: "", // New field for HDD name
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

      <DirectoryTable directories={state.directories} />
      </Box>
    </>
  );
};

export default SelectDirectoryForm;
