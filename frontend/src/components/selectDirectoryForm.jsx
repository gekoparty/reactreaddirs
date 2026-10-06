import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { Store } from "../store";
import DirectoryTable from "./directoryTable";
import PageLayout from "./PageLayout";

const SummaryTile = ({ label, value, helper }) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: 2,
      p: 2,
      flex: 1,
      minWidth: 190,
      minHeight: 96,
      bgcolor: "rgba(255, 255, 255, 0.78)",
    }}
  >
    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
      {label}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
      {value}
    </Typography>
    {helper && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {helper}
      </Typography>
    )}
  </Paper>
);

const SelectDirectoryForm = () => {
  const { state, dispatch } = useContext(Store);
  const [scanPath, setScanPath] = useState("");
  const [volumeName, setVolumeName] = useState(state.volumeName || "");
  const [viewMode, setViewMode] = useState("scanned");
  const [feedback, setFeedback] = useState(null);
  const [scanMeta, setScanMeta] = useState(null);
  const [saveSummary, setSaveSummary] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);

  const scannedDirectories = state.directories || [];
  const existingDirectories = state.existingDirectories || [];
  const savedDirectories = state.savedDirectories || [];

  const resetArrays = () => {
    dispatch({ type: "RESET_ARRAYS", payload: [] });
  };

  const resetWorkflow = () => {
    resetArrays();
    setScanMeta(null);
    setSaveSummary(null);
    setFeedback(null);
    setViewMode("scanned");
  };

  const scanDirectory = async (event) => {
    event.preventDefault();

    const trimmedPath = scanPath.trim();
    const trimmedVolume = volumeName.trim();

    if (!trimmedPath) {
      setFeedback({
        severity: "warning",
        message: "Add the folder path you want the backend to scan.",
      });
      return;
    }

    if (!trimmedVolume) {
      setFeedback({
        severity: "warning",
        message: "Add the volume name before scanning so every result is tagged correctly.",
      });
      return;
    }

    setScanning(true);
    resetArrays();
    setSaveSummary(null);
    setViewMode("scanned");
    setFeedback({
      severity: "info",
      message: "Scanning folder tree on the backend...",
    });

    try {
      const response = await axios.post("/api/directories", {
        directory: trimmedPath,
      });
      const updatedDirectories = response.data.directories.map((directory) => ({
        ...directory,
        volumeName: trimmedVolume,
      }));

      dispatch({ type: "SET_VOLUME_NAME", payload: trimmedVolume });
      dispatch({
        type: "SET_DIRECTORIES",
        payload: updatedDirectories,
      });
      setScanMeta({
        path: response.data.scannedPath || trimmedPath,
        count: response.data.count ?? updatedDirectories.length,
        durationMs: response.data.durationMs,
      });
      setFeedback({
        severity: "success",
        message: `${updatedDirectories.length.toLocaleString()} folders found. Review them, then save the new names to the database.`,
      });
    } catch (error) {
      setScanMeta(null);
      setFeedback({
        severity: "error",
        message: error.response?.data?.error || "Could not scan that folder.",
      });
    } finally {
      setScanning(false);
    }
  };

  const saveDirectories = async () => {
    const trimmedVolume = volumeName.trim();

    if (scannedDirectories.length === 0) {
      setFeedback({
        severity: "warning",
        message: "Scan a folder before saving.",
      });
      return;
    }

    if (!trimmedVolume) {
      setFeedback({
        severity: "warning",
        message: "Add the volume name before saving.",
      });
      return;
    }

    setSaving(true);
    setFeedback({
      severity: "info",
      message: "Saving on the backend and checking existing names in one batch...",
    });

    try {
      const response = await axios.post("/api/directories/save", {
        directories: scannedDirectories,
        volumeName: trimmedVolume,
      });

      const { savedDirectories: saved, existingDirectories: existing, duplicateDirectories, summary } =
        response.data;
      const duplicateRows = (duplicateDirectories || []).map((directory, index) => ({
        ...directory,
        key: `duplicate-${index}`,
        existingVolume: "Duplicate in scan",
      }));
      const skippedRows = [...(existing || []), ...duplicateRows];

      dispatch({ type: "SET_DIRECTORIES", payload: saved || [] });
      dispatch({ type: "UPDATE_SAVED_DIRECTORIES", payload: saved || [] });
      dispatch({ type: "SET_EXISTING_DIRECTORIES", payload: skippedRows });
      setSaveSummary(summary);
      setViewMode((saved || []).length > 0 ? "scanned" : "skipped");
      setFeedback({
        severity: "success",
        message: `${summary.saved.toLocaleString()} saved, ${summary.alreadyExisted.toLocaleString()} already existed, ${summary.duplicateInScan.toLocaleString()} duplicate in this scan.`,
      });
    } catch (error) {
      setFeedback({
        severity: "error",
        message: error.response?.data?.error || "Could not save the scanned directories.",
      });
    } finally {
      setSaving(false);
    }
  };

  const visibleDirectories = viewMode === "skipped" ? existingDirectories : scannedDirectories;
  const currentTableTitle = viewMode === "skipped" ? "Skipped names" : saveSummary ? "Saved names" : "Scanned folders";
  const scanCount = scanMeta?.count ?? scannedDirectories.length;
  const durationText = useMemo(() => {
    const duration = saveSummary?.durationMs ?? scanMeta?.durationMs;

    if (!duration) return "";
    if (duration < 1000) return `${duration} ms`;

    return `${(duration / 1000).toFixed(1)} s`;
  }, [saveSummary?.durationMs, scanMeta?.durationMs]);

  return (
    <PageLayout
      eyebrow="Add to database"
      title="Scan folders"
      subtitle="Pick a volume label and folder path. The backend scans the folder tree, then saves only new names after one batched database check."
    >
      <Paper
        component="form"
        onSubmit={scanDirectory}
        variant="outlined"
        sx={{
          borderRadius: 2,
          p: { xs: 2, md: 3 },
          mb: 3,
          bgcolor: "rgba(255, 255, 255, 0.86)",
        }}
      >
        {(scanning || saving) && <LinearProgress sx={{ mx: -3, mt: -3, mb: 3 }} />}
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="stretch">
          <TextField
            label="Volume name"
            value={volumeName}
            onChange={(event) => setVolumeName(event.target.value)}
            placeholder="Example: HDD 8"
            sx={{ minWidth: { lg: 220 } }}
          />
          <TextField
            label="Folder path to scan"
            value={scanPath}
            onChange={(event) => setScanPath(event.target.value)}
            placeholder="Example: G:\\Movies"
            sx={{ flex: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<FolderOpenIcon />}
            disabled={scanning || saving}
            sx={{ minWidth: 150 }}
          >
            Scan
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltIcon />}
            onClick={resetWorkflow}
            disabled={scanning || saving}
          >
            Clear
          </Button>
        </Stack>

        {feedback && (
          <Alert severity={feedback.severity} sx={{ mt: 2 }}>
            {feedback.message}
          </Alert>
        )}
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 2,
          mb: 3,
        }}
      >
        <SummaryTile
          label="Scanned"
          value={scanCount.toLocaleString()}
          helper={scanMeta?.path ? "Folders found under selected path" : "Waiting for scan"}
        />
        <SummaryTile
          label="Saved"
          value={(saveSummary?.saved ?? savedDirectories.length).toLocaleString()}
          helper="New names added to database"
        />
        <SummaryTile
          label="Skipped"
          value={(existingDirectories.length || saveSummary?.alreadyExisted || 0).toLocaleString()}
          helper="Already existed or duplicated"
        />
        <SummaryTile
          label="Backend time"
          value={durationText || "-"}
          helper="Latest scan or save response"
        />
      </Box>

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Tabs value={viewMode} onChange={(event, value) => setViewMode(value)}>
          <Tab label={saveSummary ? "Saved new" : "Scanned"} value="scanned" />
          <Tab label="Skipped" value="skipped" />
        </Tabs>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={saveDirectories}
          disabled={scanning || saving || scannedDirectories.length === 0 || Boolean(saveSummary)}
        >
          Save new names
        </Button>
      </Stack>

      <DirectoryTable
        title={currentTableTitle}
        directories={visibleDirectories}
        loading={scanning || saving}
        emptyMessage={
          viewMode === "skipped"
            ? "No skipped names yet."
            : "Scan a folder to preview directory names here."
        }
      />
    </PageLayout>
  );
};

export default SelectDirectoryForm;
