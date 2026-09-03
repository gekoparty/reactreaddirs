import React, { useEffect, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import EditIcon from "@mui/icons-material/Edit";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TableBody,
  TableRow,
  Table,
  TableContainer,
  Paper,
  TableCell,
  TextField,
  Tooltip,
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
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  overflow: "hidden",
}));

const EmptyState = styled(Box)(({ theme }) => ({
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: 8,
  color: theme.palette.text.secondary,
  padding: theme.spacing(4),
  textAlign: "center",
}));

const emptyEditValues = {
  name: "",
  volumeName: "",
};

const DirectoryTable = ({ directories = [], onDelete, onEdit }) => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [editingDirectory, setEditingDirectory] = useState(null);
  const [editValues, setEditValues] = useState(emptyEditValues);
  const [savingEdit, setSavingEdit] = useState(false);
  const canEdit = Boolean(onEdit);
  const canSelect = Boolean(onDelete || onEdit);

  useEffect(() => {
    setSelected([]);
  }, [directories, canSelect]);

  const openEdit = (directory) => {
    if (!canEdit) return;

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
    const selectedDirectory = directories.find((dir) => dir._id === selected[0]);
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
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      if (!canSelect) return;

      const newSelected = directories.map((dir) => dir._id).filter(Boolean);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    if (!canSelect) return;
    if (!id) return;

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
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const sortedRows = stableSort(
    directories,
    getComparator(order, orderBy),
    descendingComparator
  );

  const visibleRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - directories.length) : 0;

  if (directories.length === 0) {
    return <EmptyState>No directories to show yet.</EmptyState>;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <StyledPaper>
        <EnhancedTableToolbar
          numSelected={selected.length}
          onDelete={onDelete ? handleDeleteSelected : undefined}
          onEditSelected={canEdit ? handleEditSelected : undefined}
        />

        <TableContainer>
          <Table
            sx={{ minWidth: 760 }}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={directories.filter((dir) => dir._id).length}
              showSelection={canSelect}
              showActions={canEdit}
            />

            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row._id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <StyledTableRow
                    hover
                    onClick={(event) => handleClick(event, row._id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
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
                      padding="none"
                    >
                      {row.name}
                    </StyledTableCell>

                    <MutedTableCell align="left">
                      {row.volumeName || "N/A"}
                    </MutedTableCell>

                    <MutedTableCell align="left">
                      {row.existingVolume || "N/A"}
                    </MutedTableCell>

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

              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={(canSelect ? 1 : 0) + 3 + (canEdit ? 1 : 0)} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
          rowsPerPage={rowsPerPage}
          page={page}
          count={directories.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
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
