import React, { useEffect, useMemo, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  LinearProgress,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import { descendingComparator, getComparator, stableSort } from "../logic/sort";
import Pagination from "../logic/pagination";
import EnhancedTableToolbar from "./toolbar";
import EnhancedTableHead from "./EnhancedTableHead";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontWeight: 700,
  },
  "&.MuiTableCell-body": {
    color: theme.palette.text.primary,
    fontSize: 14,
  },
}));

const MutedTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-body": {
    color: theme.palette.text.secondary,
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.Mui-selected, &.Mui-selected:hover": {
    backgroundColor: theme.palette.action.selected,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  boxShadow: "0 18px 44px rgba(23, 32, 51, 0.08)",
  overflow: "hidden",
}));

const EmptyState = styled(Box)(({ theme }) => ({
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: 8,
  color: theme.palette.text.secondary,
  padding: theme.spacing(4),
  textAlign: "center",
  background: "rgba(255, 255, 255, 0.64)",
}));

const emptyEditValues = {
  name: "",
  volumeName: "",
};

const DirectoryTable = ({
  directories = [],
  onDelete,
  onEdit,
  loading = false,
  title = "Directories",
  emptyMessage = "No directories to show yet.",
  serverMode = false,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
  rowsPerPageOptions,
}) => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [selected, setSelected] = useState([]);
  const [localPage, setLocalPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(10);
  const [editingDirectory, setEditingDirectory] = useState(null);
  const [editValues, setEditValues] = useState(emptyEditValues);
  const [savingEdit, setSavingEdit] = useState(false);
  const canEdit = Boolean(onEdit);
  const canSelect = Boolean(onDelete || onEdit);
  const activePage = serverMode ? page : localPage;
  const activeRowsPerPage = serverMode ? rowsPerPage : localRowsPerPage;
  const paginationCount = serverMode ? totalCount ?? directories.length : directories.length;
  const showExistingVolume = directories.some((directory) => directory.existingVolume);

  useEffect(() => {
    setSelected([]);
  }, [directories, canSelect, activePage]);

  const sortedRows = useMemo(() => {
    if (serverMode) {
      return directories;
    }

    return stableSort(directories, getComparator(order, orderBy), descendingComparator);
  }, [directories, order, orderBy, serverMode]);

  const visibleRows = useMemo(() => {
    if (serverMode || activeRowsPerPage === -1) {
      return sortedRows;
    }

    return sortedRows.slice(
      activePage * activeRowsPerPage,
      activePage * activeRowsPerPage + activeRowsPerPage
    );
  }, [activePage, activeRowsPerPage, serverMode, sortedRows]);

  const selectableRows = visibleRows.filter((directory) => directory._id);

  const openEdit = (directory) => {
    if (!canEdit || !directory) return;

    setEditingDirectory(directory);
    setEditValues({
      name: directory.name || "",
      volumeName: directory.volumeName || "",
    });
  };

  const closeEdit = () => {
    if (savingEdit) return;

    setEditingDirectory(null);
    setEditValues(emptyEditValues);
  };

  const saveEdit = async () => {
    if (!editingDirectory) return;

    setSavingEdit(true);
    try {
      await onEdit(editingDirectory._id, editValues);
      setSelected([]);
      closeEdit();
    } finally {
      setSavingEdit(false);
    }
  };

  const handleEditSelected = () => {
    const selectedDirectory = visibleRows.find((dir) => dir._id === selected[0]);
    openEdit(selectedDirectory);
  };

  const handleDeleteSelected = () => {
    if (!onDelete) return;

    onDelete(selected);
    setSelected([]);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const isEditInvalid = !editValues.name.trim() || !editValues.volumeName.trim();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    const nextOrder = isAsc ? "desc" : "asc";

    setOrder(nextOrder);
    setOrderBy(property);
    setSelected([]);

    if (serverMode) {
      onSortChange?.({ sortBy: property, order: nextOrder });
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      if (!canSelect) return;

      setSelected(selectableRows.map((dir) => dir._id));
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    if (!canSelect || !id) return;

    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else if (selectedIndex === 0) {
      newSelected = selected.slice(1);
    } else if (selectedIndex === selected.length - 1) {
      newSelected = selected.slice(0, -1);
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1),
      ];
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    if (serverMode) {
      onPageChange?.(event, newPage);
      return;
    }

    setLocalPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const nextRowsPerPage = Number.parseInt(event.target.value, 10);

    if (serverMode) {
      onRowsPerPageChange?.(event);
      return;
    }

    setLocalRowsPerPage(nextRowsPerPage);
    setLocalPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;
  const emptyRows =
    !serverMode && activePage > 0 && activeRowsPerPage > 0
      ? Math.max(0, (1 + activePage) * activeRowsPerPage - directories.length)
      : 0;
  const columnCount = (canSelect ? 1 : 0) + 2 + (showExistingVolume ? 1 : 0) + (canEdit ? 1 : 0);

  if (!loading && directories.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <StyledPaper>
        {loading && <LinearProgress />}
        <EnhancedTableToolbar
          title={title}
          numSelected={selected.length}
          onDelete={onDelete ? handleDeleteSelected : undefined}
          onEditSelected={canEdit ? handleEditSelected : undefined}
        />

        <TableContainer>
          <Table
            sx={{ minWidth: canSelect || canEdit ? 760 : 0 }}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={selectableRows.length}
              showSelection={canSelect}
              showActions={canEdit}
              showExistingVolume={showExistingVolume}
            />

            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row._id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <StyledTableRow
                    hover
                    onClick={(event) => handleClick(event, row._id)}
                    role={canSelect ? "checkbox" : undefined}
                    aria-checked={canSelect ? isItemSelected : undefined}
                    tabIndex={-1}
                    key={row._id || `${row.name}-${index}`}
                    selected={isItemSelected}
                    sx={{ cursor: canSelect && row._id ? "pointer" : "default" }}
                  >
                    {canSelect && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          disabled={!row._id}
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                        />
                      </TableCell>
                    )}

                    <StyledTableCell
                      id={labelId}
                      component="th"
                      scope="row"
                      padding={canSelect ? "none" : "normal"}
                    >
                      {row.name}
                    </StyledTableCell>

                    <MutedTableCell align="left">
                      {row.volumeName || "N/A"}
                    </MutedTableCell>

                    {showExistingVolume && (
                      <MutedTableCell align="left">
                        {row.existingVolume || "N/A"}
                      </MutedTableCell>
                    )}

                    {canEdit && (
                      <TableCell align="right">
                        <Tooltip title="Edit directory">
                          <span>
                            <IconButton
                              color="primary"
                              disabled={!row._id}
                              onClick={(event) => {
                                event.stopPropagation();
                                openEdit(row);
                              }}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    )}
                  </StyledTableRow>
                );
              })}

              {loading && visibleRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columnCount}>
                    <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                      Loading directories...
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={columnCount} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
          rowsPerPage={activeRowsPerPage}
          page={activePage}
          count={paginationCount}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      </StyledPaper>

      <FormControlLabel
        sx={{ mt: 1.5 }}
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Compact rows"
      />

      <Dialog open={Boolean(editingDirectory)} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit directory</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            label="Directory name"
            name="name"
            value={editValues.name}
            onChange={handleEditChange}
            margin="dense"
            fullWidth
          />
          <TextField
            label="Volume name"
            name="volumeName"
            value={editValues.volumeName}
            onChange={handleEditChange}
            margin="dense"
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeEdit} disabled={savingEdit}>
            Cancel
          </Button>
          <Button
            onClick={saveEdit}
            disabled={savingEdit || isEditInvalid}
            variant="contained"
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DirectoryTable;
