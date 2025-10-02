import React, { useContext } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import DirectoryTable from "../DirectoryTable";
import { Store } from "../../store";

const SavedDirectoryTable = () => {
  const { state } = useContext(Store);
  const savedDirectories = state.savedDirectories || [];

  return (
    <Box
      sx={{
        boxShadow: 1,
        borderRadius: 2,
        p: 3,
        minWidth: 650,
        maxWidth: 900,
        mx: "auto",
        mt: 5,
      }}
    >
      <Stack direction="row" spacing={2} mb={3}>
        <Button variant="outlined" color="error" component={Link} to="/">
          Home
        </Button>
        {state.existingDirectories.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            component={Link}
            to="/existing-directories"
          >
            Existing Directories
          </Button>
        )}
      </Stack>

      {savedDirectories.length === 0 ? (
        <Typography>No saved directories found</Typography>
      ) : (
        <DirectoryTable directories={savedDirectories} />
      )}
    </Box>
  );
};

export default SavedDirectoryTable;
