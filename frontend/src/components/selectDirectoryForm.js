import React, { useState } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';

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

 //test

  return (
    <Formik
      initialValues={{
        directory: '',
      }}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <div>
            <label htmlFor="directory">Enter directory name:</label>
            <Field type="text" id="directory" name="directory" />
          </div>
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
};


export default SelectDirectoryForm;