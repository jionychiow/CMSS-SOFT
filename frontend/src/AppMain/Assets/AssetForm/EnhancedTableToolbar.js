import React, { Component } from 'react';
// MUI Components
import {
  Toolbar, Typography, IconButton, Tooltip

} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
// MUI Icons
import {
  Delete as DeleteIcon,
  AddOutlined,


} from '@mui/icons-material';
import PreviewIcon from '@mui/icons-material/Preview';

import AssetEditForm from './AssetEditForm';
// MUI Utilities
import { alpha } from '@mui/material/styles';

import AssetModal from './AssetModal';
class EnhancedTableToolbar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      menu_open: false,
      anchor: null,
      show_add_form: false,
      edit_asset: false,
      show_details: false
    }
    this.HandleClick = this.HandleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.HandleAddAsset = this.HandleAddAsset.bind(this)
    this.HandleEditsset = this.HandleEditsset.bind(this)
    this.handleCloseForm = this.handleCloseForm.bind(this)
    this.HandleOnUpdate = this.HandleOnUpdate.bind(this)
    this.HandleView = this.HandleView.bind(this)
    this.HandleCloseView = this.HandleCloseView.bind(this)
  }

  HandleClick(event) {
    if (this.state.menu_open)
      this.setState({ ...this.state, anchor: null, menu_open: false });
    else
      this.setState({ ...this.state, anchor: event.currentTarget, menu_open: true });

  };
  handleClose(event) {
    this.setState({ ...this.state, anchor: null, menu_open: false });
  };
  handleCloseForm(event) {
    this.setState({ ...this.state, show_add_form: false, edit_asset: false });
  };
  HandleView(event) {
    this.setState({ ...this.state, show_add_form: false, edit_asset: false, show_details: true });
  };
  HandleCloseView(event) {
    this.setState({ ...this.state, show_add_form: false, edit_asset: false, show_details: false });
  };
  HandleAddAsset(event) {
    this.setState({ ...this.state, show_add_form: true, edit_asset: false });
  };
  HandleEditsset(event) {
    this.setState({ ...this.state, show_add_form: true, edit_asset: true });
  };
  HandleOnUpdate() {
    this.setState({ ...this.state, show_add_form: false, edit_asset: false }, () => {

      if (this.props.OnUpdate)
        this.props.OnUpdate()
    })
  }
  render() {
    const { numSelected, asset } = this.props;

    return (
      <>
        <>
          <AssetModal
            open={this.state.show_details}
            asset={asset}
            handleClose={this.HandleCloseView}
          ></AssetModal> </>




         <AssetEditForm
          show={this.state.show_add_form}
          asset={this.state.edit_asset ? asset : null}
          handleClose={this.handleCloseForm}
          OnUpdate={this.HandleOnUpdate}

        ></AssetEditForm>
        <Toolbar sx={{
          pl: { xs: 1, sm: 2 }, pr: { xs: 1, sm: 1 }, ...(numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
          }),
        }}>

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

          {numSelected > 1 && <>
            <Tooltip title="删除">
              <IconButton
                onClick={this.props.onDelete}
                sx={{
                  width: { xs: '36px', sm: '40px' },
                  height: { xs: '36px', sm: '40px' }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>

          </>}

          {numSelected === 1 &&
            <>

              <Tooltip title="查看">
                <IconButton
                  onClick={this.HandleView}
                  sx={{
                    width: { xs: '36px', sm: '40px' },
                    height: { xs: '36px', sm: '40px' }
                  }}
                >
                  <PreviewIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="编辑">
                <IconButton
                  onClick={this.HandleEditsset}
                  sx={{
                    width: { xs: '36px', sm: '40px' },
                    height: { xs: '36px', sm: '40px' }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="删除">
                <IconButton
                  onClick={this.props.onDelete}
                  sx={{
                    width: { xs: '36px', sm: '40px' },
                    height: { xs: '36px', sm: '40px' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>


            </>
          }

          {numSelected === 0 &&
            <>
              <Tooltip title="新建设备" >

                <IconButton
                  onClick={this.HandleAddAsset}
                  sx={{
                    width: { xs: '36px', sm: '40px' },
                    height: { xs: '36px', sm: '40px' }
                  }}
                >
                  <AddOutlined />
                </IconButton>



              </Tooltip>



            </>
          }


        </Toolbar>
      </>
    );
  }
}

export default EnhancedTableToolbar;