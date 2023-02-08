import React, { useState } from "react";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import InputLabel from "@mui/material/InputLabel";

import FormControl from "@mui/material/FormControl";

import DirectoryTable from "./directoryTable";

const SelectDirectoryForm = () => {
  const [directories, setDirectories] = useState([]);

  const fetchDirectories = async (values, { setSubmitting }) => {
    try {
      setDirectories([]);
      const response = await axios.post("api/directories", {
        directory: values.directory,
      });
      setDirectories(response.data.directories);
      console.log("Directory names:", response.data.directories);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const volumeNumber = 1;

const handleSave = async (values, {setSubmitting}) => {
  try {
  const response = await axios.post("api/directories/save", {
    directories,
    volumeNumber,
  });
  if (response.status === 200) {
    console.log("success")
  } else {
    // Handle error
  }
} catch (error) {
  // Handle error
} finally {
  setSubmitting(false);
}
};
  

  return (
    <>
      <Formik
        initialValues={{
          directory: "",
        }}
        onSubmit={fetchDirectories}
      >
        {({ values, handleChange, isSubmitting,setSubmitting }) => (
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
            {directories.length > 0 && (
              <Button
              style={{marginLeft: "10px"}}
                variant="contained"
                color="warning"
                type="submit"
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  handleSave(values, { setSubmitting });
                }}
                >
                  Save</Button>
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
        <DirectoryTable directories={directories} />
      </Box>
    </>
  );
};

export default SelectDirectoryForm;
