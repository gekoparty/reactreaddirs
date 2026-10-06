import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PageLayout from "../PageLayout";
import DirectoryTable from "../directoryTable";

const Metric = ({ label, value, helper }) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: 2,
      p: 2,
      flex: 1,
      minWidth: 190,
      bgcolor: "rgba(255, 255, 255, 0.78)",
    }}
  >
    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0 }}>
      {label}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: 800 }}>
      {value}
    </Typography>
    {helper && (
      <Typography variant="body2" color="text.secondary">
        {helper}
      </Typography>
    )}
  </Paper>
);

const SearchTable = () => {
  const [directories, setDirectories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [volumeQuery, setVolumeQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalMatching, setTotalMatching] = useState(0);
  const [durationMs, setDurationMs] = useState(null);
  const [sortState, setSortState] = useState({ sortBy: "name", order: "asc" });
  const [feedback, setFeedback] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get("/api/directories", {
          params: {
            search: searchQuery,
            volume: volumeQuery,
            page: page + 1,
            limit: rowsPerPage,
            sortBy: sortState.sortBy,
            order: sortState.order,
          },
          signal: controller.signal,
        });

        setDirectories(response.data.directories || []);
        setTotal(response.data.total || 0);
        setTotalMatching(response.data.totalMatching || 0);
        setDurationMs(response.data.durationMs);
      } catch (err) {
        if (err.name === "CanceledError") return;

        setDirectories([]);
        setError(err.response?.data?.error || "Could not search the database.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [page, refreshKey, rowsPerPage, searchQuery, sortState.order, sortState.sortBy, volumeQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setVolumeQuery("");
    setPage(0);
  };

  const handleDelete = async (selected) => {
    try {
      const response = await axios.post("/api/directories/delete", { ids: selected });

      setFeedback({
        severity: "success",
        message: `${response.data.deletedCount ?? selected.length} director${
          selected.length === 1 ? "y" : "ies"
        } deleted.`,
      });
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setFeedback({
        severity: "error",
        message: err.response?.data?.error || "Could not delete the selected directories.",
      });
    }
  };

  const handleEdit = async (id, values) => {
    try {
      await axios.put(`/api/directories/${id}`, values);
      setFeedback({
        severity: "success",
        message: "Directory updated.",
      });
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setFeedback({
        severity: "error",
        message: err.response?.data?.error || "Could not update the directory.",
      });
      throw err;
    }
  };

  const handleSortChange = (nextSort) => {
    setSortState(nextSort);
    setPage(0);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const rangeText = useMemo(() => {
    if (totalMatching === 0) {
      return "0";
    }

    const start = page * rowsPerPage + 1;
    const end = Math.min(totalMatching, start + rowsPerPage - 1);

    return `${start.toLocaleString()}-${end.toLocaleString()}`;
  }, [page, rowsPerPage, totalMatching]);

  return (
    <PageLayout
      eyebrow="Database"
      title="Search saved folders"
      subtitle="Filters, sorting, and pagination now run on the backend, so the browser only renders the current result page."
    >
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          p: { xs: 2, md: 3 },
          mb: 3,
          bgcolor: "rgba(255, 255, 255, 0.86)",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Folder name"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Volume"
            value={volumeQuery}
            onChange={(event) => {
              setVolumeQuery(event.target.value);
              setPage(0);
            }}
            sx={{ width: { xs: "100%", md: 260 } }}
          />
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltIcon />}
            onClick={clearFilters}
          >
            Clear
          </Button>
        </Stack>

        {feedback && (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)} sx={{ mt: 2 }}>
            {feedback.message}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
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
        <Metric
          label="Matching"
          value={totalMatching.toLocaleString()}
          helper="Rows matching current filters"
        />
        <Metric
          label="Database total"
          value={total.toLocaleString()}
          helper="Estimated saved folders"
        />
        <Metric label="Showing" value={rangeText} helper="Current page range" />
        <Metric
          label="Backend time"
          value={durationMs == null ? "-" : `${durationMs} ms`}
          helper="Latest search response"
        />
      </Box>

      <DirectoryTable
        title="Database results"
        directories={directories}
        loading={loading}
        onDelete={handleDelete}
        onEdit={handleEdit}
        serverMode
        totalCount={totalMatching}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(event, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSortChange={handleSortChange}
        rowsPerPageOptions={[10, 25, 50, 100]}
        emptyMessage="No folders match these filters."
      />
    </PageLayout>
  );
};

export default SearchTable;
