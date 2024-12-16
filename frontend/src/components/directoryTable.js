import React, { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import {
  TableBody,
  TableRow,
  Table,
  TableContainer,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";

import { descendingComparator, getComparator, stableSort } from "../logic/sort";
import Pagination from "../logic/pagination";
import EnhancedTableToolbar from "./toolbar";
import EnhancedTableHead from "./EnhancedTableHead";

const StyledTableCell = styled(TableCell)(({ className, theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ className, theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const DirectoryTable = (props) => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("calories");
  const [selected, setSelected] = useState([]); // Holds _id of selected directories
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { directories, onDelete } = props;

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = directories.map((n) => n._id); // Use _id for select all
      setSelected(newSelected);
      console.log("Select all clicked. New selected:", newSelected);
      return;
    }
    setSelected([]);
    console.log("Deselect all clicked.");
  };

  const handleClick = (event, id) => { // Use _id for row selection
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
    console.log(`Row clicked: ${id}. New selected:`, newSelected);
  };

  console.log("Current selection:", selected);

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

  const isSelected = (id) => selected.indexOf(id) !== -1; // Check based on _id

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - directories.length) : 0;

  return (
    <>
      {directories ? (
        <Box
          sx={{
            boxShadow: 1,
            borderRadius: 2,
            p: 2,
            maxWidth: 800,
            margin: "auto",
          }}
        >
          <Paper sx={{ width: "100%", mb: 2 }}>
            <EnhancedTableToolbar
              numSelected={selected.length}
              onDelete={() => {
                console.log("Delete button clicked. Selected items:", selected);
                onDelete(selected); // Pass _id to onDelete
              }}
            />
            <TableContainer>
              <Table
                sx={{ minWidth: 700 }}
                aria-labelledby="tableTitle"
                size={dense ? "small" : "medium"}
              >
                <EnhancedTableHead
                  classes={{
                    head: tableCellClasses.head,
                    body: tableCellClasses.body,
                  }}
                  component={StyledTableCell}
                  numSelected={selected.length}
                  order={order}
                  orderBy={orderBy}
                  onSelectAllClick={handleSelectAllClick}
                  onRequestSort={handleRequestSort}
                  rowCount={directories.length}
                />

                <TableBody>
                  {stableSort(
                    directories,
                    getComparator(order, orderBy),
                    descendingComparator
                  )
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      const isItemSelected = isSelected(row._id); // Check based on _id
                      const labelId = `enhanced-table-checkbox-${index}`;

                      return (
                        <StyledTableRow
                          hover
                          className="classes.root"
                          onClick={(event) => handleClick(event, row._id)} // Use _id for row selection
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={row._id} // Use _id as the key
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              color="primary"
                              checked={isItemSelected}
                              inputProps={{
                                "aria-labelledby": labelId,
                              }}
                            />
                          </TableCell>
                          <TableCell id={labelId} scope="row" padding="none">
                            {row.name}
                          </TableCell>
                          <TableCell align="center">
                            {row.volumeName || "N/A"}
                          </TableCell>
                          {/* Add new column for existing volume */}
                          <TableCell align="center">
                            {row.existingVolume || "N/A"}
                          </TableCell>
                        </StyledTableRow>
                      );
                    })}
                  {emptyRows > 0 && (
                    <TableRow
                      style={{
                        height: (dense ? 33 : 53) * emptyRows,
                      }}
                    >
                      <TableCell colSpan={6} />
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
          </Paper>
          <FormControlLabel
            control={<Switch checked={dense} onChange={handleChangeDense} />}
            label="Dense padding"
          />
        </Box>
      ) : (
        <div>nothing</div>
      )}
    </>
  );
};

export default DirectoryTable;
