import PropTypes from "prop-types";
import { visuallyHidden } from "@mui/utils";
import {
  TableSortLabel,
  TableHead,
  Checkbox,
  Box,
  TableRow,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import './styledTheadRow.css';

const StyledTheadRow = styled(TableRow)(({ theme }) => ({
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const StyledTheadCell = styled(TableCell)(({ className, theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

function EnhancedTableHead({
  classes,
  numSelected,
  order,
  orderBy,
  onSelectAllClick,
  onRequestSort,
  rowCount,
}) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const headCells = [
    {
      id: "name",
      numeric: false,
      disablePadding: true,
      label: "Name",
    },
    { id: "volume", numeric: false, disablePadding: true, label: "Volume" },
  ];

  return (
    <TableHead component={"tbody" || StyledTheadCell}>
      <StyledTheadRow>
        <StyledTheadCell padding="checkbox">
          <Checkbox
            color="default"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            className={classes.head}
            inputProps={{
              "aria-label": "select all",
            }}
          />
        </StyledTheadCell>
        {headCells.map((headCell) => (
          <StyledTheadCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </StyledTheadCell>
        ))}
      </StyledTheadRow>
    </TableHead>
  );
}

export default EnhancedTableHead;

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};
