import React from "react";
import { TableBody, TableHead, TableRow, Table, TableContainer, Paper } from "@mui/material";
import { styled } from '@mui/material/styles';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));


const DirectoryTable = ({ directories }) => (
  <TableContainer component={Paper}>
    <Table sx={{ minWidth: 700 }} aria-label="customized table">
      <TableHead>
        <TableRow>
          <StyledTableCell>Name</StyledTableCell>
          <StyledTableCell align="right">Volume</StyledTableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {directories.map(({ key, name }) => (
          <StyledTableRow key={key}>
            <TableCell>{name}</TableCell>
            <StyledTableCell align="right">1</StyledTableCell>
          </StyledTableRow>
          
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default DirectoryTable;





