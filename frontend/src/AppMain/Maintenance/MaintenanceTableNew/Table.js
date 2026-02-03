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

import EnhancedTableToolbar from '../MaintenanceForm/EnhancedTableToolbar';

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
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: '名称',
  },
  {
    id: 'ref',
    numeric: false,
    disablePadding: false,
    label: '参考号',
  },
  {
    id: 'created_by',
    numeric: false,
    disablePadding: false,
    label: '创建者',
  },
  {
    id: 'assigned_to',
    numeric: false,
    disablePadding: false,
    label: '分配给',
  },
  {
    id: 'asset',
    numeric: false,
    disablePadding: false,
    label: '资产',
  },
  {
    id: 'planned_starting_date',
    numeric: false,
    disablePadding: false,
    label: '计划开始时间',
  },

  {
    id: 'started_at',
    numeric: false,
    disablePadding: false,
    label: '开始时间',
  },
  {
    id: 'type',
    numeric: false,
    disablePadding: false,
    label: '类型',
  },
  {
    id: 'priority',
    numeric: false,
    disablePadding: false,
    label: '优先级',
  },
  {
    id: 'status',
    numeric: false,
    disablePadding: false,
    label: '状态',
  },
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead key={'maintenance-table'}>
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
            key={headCell.id}
            align={headCell.numeric ? 'left' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
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
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          维修记录
        </Typography>
      )}

      {numSelected > 0 ? (
        <>
        <Tooltip title="删除">
          <IconButton>
            <DeleteIcon onClick={props.onDelete} />
          </IconButton>
        </Tooltip>
        </>
      ) : (
        <>
        <Tooltip title="筛选列表">
          <IconButton>
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

export default function EnhancedTable({ rows ,handleDelete,OnUpdate,assets,users}) {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const dense = false;
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // 24小时制时间格式化函数
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };
 
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
 
  const onDelete = (event) => {
    handleDelete(selected);
  };

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
    [order, orderBy, page, rowsPerPage, rows],
  );

  let edit_obj = rows.filter((row) => row.uuid === selected[0])[0];

  return (
    <Box sx={{ width: '100%' }}>
      <Paper 
        sx={{ 
          width: '100%', 
          mb: 2,
          borderRadius: 4,
          boxShadow: 6,
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'box-shadow 0.3s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: 8,
            transform: 'translateY(-1px)',
          }
        }}
      >
        <EnhancedTableToolbar 
          OnUpdate={OnUpdate}
          numSelected={selected.length} 
          maintenance={edit_obj} 
          onDelete={onDelete} 
          assets={assets}
          users={users}
        />
        <TableContainer>
          <Table
            sx={{ 
              minWidth: { xs: '320px', sm: 750 },
              '& .MuiTableCell-root': {
                paddingLeft: { xs: 1, sm: 1.5, md: 2 },
                paddingRight: { xs: 1, sm: 1.5, md: 2 },
                paddingTop: { xs: 1, sm: 1.25, md: 1.5 },
                paddingBottom: { xs: 1, sm: 1.25, md: 1.5 },
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                whiteSpace: { xs: 'nowrap', sm: 'normal' },
                borderBottom: '1px solid',
                borderBottomColor: 'divider',
              },
              '& .MuiTableHead-root .MuiTableCell-root': {
                backgroundColor: 'background.paper',
                fontWeight: 'bold',
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }
              },
              '& .MuiTableRow-root:hover': {
                backgroundColor: 'action.hover',
                transition: 'background-color 0.2s ease',
              },
              '& .MuiTableRow-root.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                }
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
                const statusColors = {
                  'Completed': 'success',
                  'Cancelled': 'secondary',
                  'In Progress': 'primary',
                  'Pending': 'error'
                };
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.uuid)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.uuid}
                    selected={isItemSelected}
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: 1,
                        transform: 'translateY(-1px)',
                      }
                    }}
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
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                      sx={{
                        fontWeight: 'medium',
                        color: 'text.primary'
                      }}
                    >
                      {row.name}
                    </TableCell>

                    <TableCell align="left" sx={{ color: 'text.secondary' }}>{row.ref}</TableCell>
                    <TableCell align="left" sx={{ color: 'text.secondary' }}>{row.created_by?.username}</TableCell>
                    <TableCell align="left" sx={{ color: 'text.secondary' }}>{row.assigned_to?.username}</TableCell>
                    <TableCell align="left" sx={{ color: 'text.secondary' }}>{row.asset?.name}</TableCell>
                    <TableCell align="left" sx={{ color: 'text.secondary' }}>{formatDateTime(row.planned_starting_date)}</TableCell>
                    <TableCell align="left" sx={{ color: 'text.secondary' }}>{row.started_at ? formatDateTime(row.started_at) : '未开始'}</TableCell>
                    <TableCell align="left" sx={{ color: 'text.secondary' }}>{row.type}</TableCell>
                    <TableCell align="left" sx={{ color: 'text.secondary' }}>{row.priority}</TableCell>
                    <TableCell align="left">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mr: 1, 
                            fontWeight: 'medium',
                            color: `${statusColors[row.status]}.main`
                          }}
                        >
                          {row.status}
                        </Typography>
                        <LinearProgress 
                          color={statusColors[row.status]} 
                          variant="determinate" 
                          value={50} 
                          valueBuffer={50}
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            flex: 1,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                            }
                          }}
                        />
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
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '.MuiTablePagination-selectLabel': {
              marginBottom: { xs: '8px', sm: 0 }
            },
            '.MuiTablePagination-input': {
              marginBottom: { xs: '8px', sm: 0 }
            }
          }}
        />
      </Paper>
    </Box>
  );
}