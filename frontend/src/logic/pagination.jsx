import React from "react";
import TablePagination from "@mui/material/TablePagination";

const Pagination = ({
  rowsPerPage,
  page,
  count,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50, { value: -1, label: "All" }],
}) => {
  return (
    <TablePagination
      component="div"
      count={count}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageOptions={rowsPerPageOptions}
    />
  );
};

export default Pagination;
