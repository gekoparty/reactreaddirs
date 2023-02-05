import React, { useState } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import FormControl from '@mui/material/FormControl';
import { InputLabel } from '@mui/material';



const SelectDirectoryForm = () => {
  const [directories, setDirectories] = useState([]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post('api/directories', { directory: values.directory });
      setDirectories(response.data.directories);
      console.log('Directory names:', response.data.directories);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

 

  return (
    <Formik
      initialValues={{
        directory: '',
      }}
      onSubmit={handleSubmit}
    >
      {({ values, handleChange, isSubmitting }) => (
        <Form style={{marginTop: "30px"}}>
          <FormControl>
            <InputLabel htmlFor="directory"></InputLabel>
            <TextField
            color="warning"
            size='small'
            label="Enter directory name"
            id="directory"
            name="directory"
            value={values.directory}
            onChange={handleChange}
          />
          </FormControl>
          <Button 
          variant="contained"
          color="primary"  
          type="submit" disabled={isSubmitting}>
            Submit
          </Button>
        </Form>
      )}
    </Formik>
  );
};


export default SelectDirectoryForm;