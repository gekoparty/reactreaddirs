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
import TableCell from "@mui/material/TableCell";

const StyledTheadRow = styled(TableRow)(({ theme }) => ({
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const StyledTheadCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    fontWeight: 700,
  },
}));

function EnhancedTableHead({
  numSelected,
  order,
  orderBy,
  onSelectAllClick,
  onRequestSort,
  rowCount,
  showSelection = true,
  showActions = false,
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
    {
      id: "volumeName",
      numeric: false,
      disablePadding: false,
      label: "Volume Name",
    },
    {
      id: "existingVolume",
      numeric: false,
      disablePadding: false,
      label: "Existing Volume",
    },
  ];

  return (
    <TableHead>
      <StyledTheadRow>
        {showSelection && (
          <StyledTheadCell padding="checkbox">
            <Checkbox
              color="default"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                "aria-label": "select all directories",
              }}
            />
          </StyledTheadCell>
        )}

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
        {showActions && <StyledTheadCell align="right">Actions</StyledTheadCell>}
      </StyledTheadRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
  showSelection: PropTypes.bool,
  showActions: PropTypes.bool,
};

export default EnhancedTableHead;
