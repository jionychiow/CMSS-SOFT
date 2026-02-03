import React from 'react';
import PropTypes from 'prop-types';

// MUI Components
import {
  Box,Table,TableBody,TableCell,TableContainer,TableHead,TablePagination,TableRow,
  TableSortLabel,Toolbar,Typography,Paper,Checkbox,IconButton,Tooltip,LinearProgress
} from '@mui/material';

// MUI Icons
import {
  Delete as DeleteIcon,
  FilterList as FilterListIcon,

} from '@mui/icons-material';

// MUI Utilities
import { alpha } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';



import EnhancedTableToolbar from '../AssetForm/EnhancedTableToolbar';
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    uuid: 'phase',
    numeric: false,
    disablePadding: false,
    label: '期别',
  },
  {
    uuid: 'production_line',
    numeric: false,
    disablePadding: false,
    label: '产线',
  },
  {
    uuid: 'process',
    numeric: false,
    disablePadding: false,
    label: '工序',
  },
  {
    uuid: 'name',
    numeric: false,
    disablePadding: true,
    label: '设备型号',
  },
  {
    uuid: 'ref',
    numeric: false,
    disablePadding: false,
    label: '设备编码',
  },
  {
    uuid: 'status',
    numeric: false,
    disablePadding: false,
    label: '设备状态',
  },
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead key={'Asset-table'}>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all assets',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.uuid}
            align={headCell.numeric ? 'left' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.uuid ? order : false}
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
              py: { xs: 0.5, sm: 0.75, md: 1.5 },
              px: { xs: 0.5, sm: 1, md: 2 },
              whiteSpace: { xs: 'nowrap', sm: 'normal' }
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.uuid}
              direction={orderBy === headCell.uuid ? order : 'asc'}
              onClick={createSortHandler(headCell.uuid)}
            >
              {headCell.label}
              {orderBy === headCell.uuid ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar2(props) {
  const { numSelected } = props;

  return (
    <Toolbar
      sx={{
        pl: { xs: 1, sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ 
            flex: '1 1 100%',
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          已选择 {numSelected} 项
        </Typography>
      ) : (
        <Typography
              sx={{ 
                flex: '1 1 100%',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              设备
            </Typography>
      )}

      

      {numSelected > 0 ? (
        <>
        <Tooltip title="删除">
          <IconButton
            sx={{
              width: { xs: '36px', sm: '40px' },
              height: { xs: '36px', sm: '40px' }
            }}
          >
            <DeleteIcon onClick={props.onDelete} />
          </IconButton>
        </Tooltip>
        
        </>
      ) : (
        <>
        <Tooltip title="筛选列表">
          <IconButton
            sx={{
              width: { xs: '36px', sm: '40px' },
              height: { xs: '36px', sm: '40px' }
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        
        </>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar2.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default function EnhancedTable({ rows ,handleDelete,OnUpdate}) {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const dense = false;
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
 const onDelete = (event) =>{
  handleDelete(selected)
 }
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.uuid);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
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
        selected.slice(selectedIndex + 1),
      );
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


  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      stableSort(rows, getComparator(order, orderBy)).slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      ),
    [order, orderBy, page, rowsPerPage,rows],
  );
 
 let edit_obj = rows.filter((row)=>row.uuid === selected[0])[0]
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar 
                              OnUpdate = {OnUpdate}
                              numSelected={selected.length} 
                              asset={edit_obj} 
                              onDelete = {onDelete} />
        <TableContainer>
          <Table
            sx={{ 
              minWidth: { xs: '320px', sm: 750 },
              '& .MuiTableCell-root': {
                paddingLeft: { xs: 0.5, sm: 1, md: 2 },
                paddingRight: { xs: 0.5, sm: 1, md: 2 },
                paddingTop: { xs: 0.5, sm: 0.75, md: 1.5 },
                paddingBottom: { xs: 0.5, sm: 0.75, md: 1.5 },
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                whiteSpace: { xs: 'nowrap', sm: 'normal' }
              }
            }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row.uuid);
                const labelId = `enhanced-table-checkbox-${index}`;
                const status_colors = {
                  'Active':'success',
                  'Inactive':'secondary',
                  'Under Maintenance':'error'
                }
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.uuid)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.uuid}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell 
                      align="left" 
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                        py: { xs: 0.5, sm: 0.75, md: 1.5 },
                        px: { xs: 0.5, sm: 1, md: 2 }
                      }}
                    > 
                      {row.phase_name || '未指定'} 
                    </TableCell>
                    <TableCell 
                      align="left" 
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                        py: { xs: 0.5, sm: 0.75, md: 1.5 },
                        px: { xs: 0.5, sm: 1, md: 2 }
                      }}
                    > 
                      {row.production_line_name || '未指定'} 
                    </TableCell>
                    <TableCell 
                      align="left" 
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                        py: { xs: 0.5, sm: 0.75, md: 1.5 },
                        px: { xs: 0.5, sm: 1, md: 2 }
                      }}
                    > 
                      {row.process_name || '未指定'} 
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                        py: { xs: 0.5, sm: 0.75, md: 1.5 },
                        px: { xs: 0.5, sm: 1, md: 2 }
                      }}
                    >
                      {row.name}
                    </TableCell>
                    
                    <TableCell 
                      align="left" 
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                        py: { xs: 0.5, sm: 0.75, md: 1.5 },
                        px: { xs: 0.5, sm: 1, md: 2 }
                      }}
                    >
                      {row.ref}
                    </TableCell>
                    <TableCell 
                      align="left" 
                      sx={{ 
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                        py: { xs: 0.5, sm: 0.75, md: 1.5 },
                        px: { xs: 0.5, sm: 1, md: 2 }
                      }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ minWidth: 0, flex: 1, wordBreak: 'break-word' }}>
                          {row.status === 'Active' && '启用'}
                          {row.status === 'Inactive' && '停机'}
                          {row.status === 'Under Maintenance' && '维护中'}
                          {row.status === 'Retired' && '已退役'}
                        </Box>
                        <Box sx={{ width: '25px', flexShrink: 0 }}>
                          <LinearProgress 
                            color={status_colors[row.status]} 
                            variant="determinate" 
                            value={50} 
                            valueBuffer={50} 
                            sx={{ height: 3, borderRadius: 1.5 }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页行数:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} 共 ${count} 条`}
          sx={{
            '& .MuiTablePagination-selectLabel': {
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
            },
            '& .MuiTablePagination-displayedRows': {
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
            },
            '& .MuiTablePagination-select': {
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' }
            }
          }}
        />
      </Paper>
    
    </Box>
  );
}
