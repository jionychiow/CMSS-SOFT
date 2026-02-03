import React, { Component } from 'react';
// MUI Components
import {
    Toolbar,Typography,IconButton,Tooltip,
    MenuItem,Menu,
    
  } from '@mui/material';
  import EditIcon from '@mui/icons-material/Edit';
  // MUI Icons
  import {
    Delete as DeleteIcon,
    AddOutlined,
  
  
  } from '@mui/icons-material';
  
  import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
  import MaintenanceRecordForm from './MaintenanceEditForm';
  // MUI Utilities
  import { alpha } from '@mui/material/styles';
  import { visuallyHidden } from '@mui/utils';

class EnhancedTableToolbar extends Component {
    constructor(props){
        super(props)
        this.state = {
            menu_open:false,
            anchor:null,
            show_add_form:false,
            edit_asset:false
        }
        this.HandleClick = this.HandleClick.bind(this)
        this.handleClose = this.handleClose.bind(this)
        this.HandleAddAsset = this.HandleAddAsset.bind(this)
        this.HandleEditsset = this.HandleEditsset.bind(this)
        this.handleCloseForm = this.handleCloseForm.bind(this)
        this.HandleOnUpdate = this.HandleOnUpdate.bind(this)
    }
    
     HandleClick (event) {
      if(this.state.menu_open)
        this.setState({...this.state, anchor:null, menu_open:false});
      else
        this.setState({...this.state, anchor:event.currentTarget, menu_open:true});
        
      };
       handleClose (event)  {
        this.setState({...this.state, anchor:null ,menu_open:false});
      };
       handleCloseForm (event)  {
        this.setState({...this.state, show_add_form:false ,edit_asset:false});
      };
      
      HandleAddAsset (event)  {
        this.setState({...this.state, show_add_form:true ,edit_asset:false});
      };
      HandleEditsset (event)  {
        this.setState({...this.state, show_add_form:true ,edit_asset:true});
      };
      HandleOnUpdate () {
        this.setState({...this.state, show_add_form:false,edit_asset:false,show_details:false},()=>{

        if(this.props.OnUpdate) {
          this.props.OnUpdate()
        }
          
        })
      }
    render() {
        console.log('EnhancedTableToolbar props:', this.props); // 调试信息
        const { numSelected,maintenance } = this.props;
        const { asset,users,assets } = this.props;
        console.log('EnhancedTableToolbar users:', users); // 调试信息
        
        return (
            <>
            
         
         <MaintenanceRecordForm 
                          show={this.state.show_add_form}
                          maintenancePlan={this.state.edit_asset? maintenance:null}
                          handleClose={this.handleCloseForm}
                          OnUpdate={this.HandleOnUpdate}
                          users={users}
                          assets={this.props.assets}
                          
                          ></MaintenanceRecordForm>
                 <Toolbar sx={{pl: { sm: 2 },pr: { xs: 1, sm: 1 }, ...(numSelected > 0 && {bgcolor: (theme) =>
                          alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                            }),
                        }}>

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

      {numSelected > 1 && <>
        <Tooltip title="删除">
          <IconButton>
            <DeleteIcon onClick={this.props.onDelete} />
          </IconButton>
        </Tooltip>
        
        </> }

        { numSelected === 1 &&
         <>
         
         <Tooltip title="编辑">
           <IconButton>
             <EditIcon  onClick={this.HandleEditsset}/>
           </IconButton>
         </Tooltip>
         <Tooltip title="删除">
           <IconButton>
             <DeleteIcon onClick={this.props.onDelete} />
           </IconButton>
         </Tooltip>
         
         
         </>
        }

      {numSelected ===0 && 
      <>
      
      </>
      }

      
    </Toolbar>
            </>
        );
    }
}

export default EnhancedTableToolbar;