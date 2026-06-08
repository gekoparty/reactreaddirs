import React, { useContext } from "react";
import { Box, Typography } from "@mui/material";
import DirectoryTable from "../directoryTable"
import PermanentDrawerLeft from "../PermanentDrawerLeft";
import { Store } from "../../store";

const ExistingDirectoryTable = () => {
  const { state } = useContext(Store);
  const existingDirectories = state.existingDirectories || [];

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: 4,
      }}
    >
      <PermanentDrawerLeft />
      <Box component="main" sx={{ ml: { md: "240px" }, maxWidth: 1100 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Already existed
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Names skipped because they already exist in the database.
        </Typography>
        <DirectoryTable directories={existingDirectories} />
      </Box>
    </Box>
  );
};

export default ExistingDirectoryTable;
