import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Stack, Typography } from "@mui/material";
import DirectoryTable from "../DirectoryTable";
import { Store } from "../../store";

const ExistingDirectoryTable = () => {
  const { state } = useContext(Store);
  const existingDirectories = state.existingDirectories || [];

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
        {state.savedDirectories.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            component={Link}
            to="/saved-directories"
          >
            Saved Directories
          </Button>
        )}
      </Stack>

      {existingDirectories.length === 0 ? (
        <Typography>No existing directories found</Typography>
      ) : (
        <DirectoryTable directories={existingDirectories} />
      )}
    </Box>
  );
};

export default ExistingDirectoryTable;
