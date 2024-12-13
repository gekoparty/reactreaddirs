import React, { useContext } from "react";
import { Box } from "@mui/system";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import DirectoryTable from "../DirectoryTable";
import { Store } from "../../store";

const SavedDirectoryTable = (props) => {
  const { state } = useContext(Store);
  const savedDirectories = state.savedDirectories || [];

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
    ><Button variant="outlined" color="error">
      <Link style={{textDecoration: "none"}} to="/">Home</Link>
      </Button>
      {state.existingDirectories.length > 0 && (
        <Button variant="outlined" color="error">
        <Link style={{ textDecoration: "none"}} to="/existing-directories">Existing Directories</Link>
        </Button>
      )}
      {savedDirectories.length === 0 || null ? (
        <div>No saved directories found</div>
      ) : (
        <DirectoryTable directories={savedDirectories} />
      )}
    </Box>
  );
};

export default SavedDirectoryTable;
