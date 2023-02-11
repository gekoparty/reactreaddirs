import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import InputLabel from "@mui/material/InputLabel";
import { Link } from "react-router-dom";
import { Store } from "../store";

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
      ctxDispatch({
        type: "SET_DIRECTORIES",
        payload: response.data.directories,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const volumeNumber = 1;

  const handleSave = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post("api/directories/save", {
        directories: state.directories,
        volumeName: volumeNumber.toString(),
      });
      if (response.status === 200) {
        await new Promise((resolve) => {
          ctxDispatch({
            type: "UPDATE_SAVED_DIRECTORIES",
            payload: response.data.savedDirectories,
          });
          ctxDispatch({
            type: "UPDATE_EXISTING_DIRECTORIES",
            payload: response.data.existingDirectories,
          });
          resolve();
        });
        console.log("savedDirectories: ", state.savedDirectories);
        console.log("existingDirectories: ", state.existingDirectories);
        console.log("success");
      } else {
        console.error("Error while saving the directories");
      }
    } catch (error) {
      console.error(error);
      console.error("Error while saving the directories");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {state.savedDirectories.length > 0 && (
        <Link to="/saved-directories">Saved Directories</Link>
      )}
      {state.existingDirectories.length > 0 && (
        <Link to="/existing-directories">Existing Directories</Link>
      )}

      <Formik
        initialValues={{
          directory: "",
        }}
        onSubmit={fetchDirectories}
      >
        {({ values, handleChange, isSubmitting, setSubmitting }) => (
          <Form style={{ marginTop: "30px" }}>
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

      <Box
        sx={{
          boxShadow: 1,
          borderRadius: 2,
          p: 2,
          minWidth: 650,
          maxWidth: 800,
          margin: "auto",
        }}
      >
        <DirectoryTable directories={state.directories}/>
      </Box>
    </>
  );
};

export default SelectDirectoryForm;
