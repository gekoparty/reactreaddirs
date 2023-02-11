import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Box } from "@mui/system";
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
      <Link to="/">Home</Link>
      {state.savedDirectories.length > 0 && (
        <Link to="/saved-directories">Saved Directories</Link>
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
