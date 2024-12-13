import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/system";
import Button from "@mui/material/Button";
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
        p: 2,
        minWidth: 650,
        maxWidth: 800,
        margin: "auto",
      }}
    >
       <Button variant="outlined" color="error">
      <Link style={{textDecoration: "none"}} to="/">Home</Link>
      </Button>
      {state.savedDirectories.length > 0 && (
        <Button variant="outlined" color="error">
        <Link style={{textDecoration: "none"}} to="/saved-directories">Saved Directories</Link>
        </Button>
      )}
      {existingDirectories.length === 0 || null ? (
        <div>No existing directories found</div>
      ) : (
        <DirectoryTable directories={existingDirectories} />
      )}
    </Box>
  );
};

export default ExistingDirectoryTable;
