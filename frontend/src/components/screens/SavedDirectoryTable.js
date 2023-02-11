import React, { useContext } from "react";
import { Box } from "@mui/system";
import { Link } from "react-router-dom";
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
    >
      <Link to="/">Home</Link>
      {state.existingDirectories.length > 0 && (
        <Link to="/existing-directories">Existing Directories</Link>
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
