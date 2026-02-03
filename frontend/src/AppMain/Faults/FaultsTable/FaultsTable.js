
import React, { Component } from 'react';
import AuthContext from '../../../AuthProvider/AuthContext';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import { url } from '../../../Config';
import Stack from '@mui/material/Stack';
import FaultsDelete from '../FaultsForm/FaultsDelete'
import EnhancedTable from './Table';
import {  Backdrop, CircularProgress } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import FmdBadIcon from '@mui/icons-material/FmdBad';
import { Link as RouterLink } from 'react-router-dom';
class FaultsTable extends Component {
    constructor(propos) {
        super(propos)
        this.state = {
            is_loading: true,
            faults_data : [],
            faults_to_delete:[],
            delete_form:false,
            assets:[]
            
        }
        this.refreshData = this.refreshData.bind(this)
        this.deleteFaults = this.deleteFaults.bind(this)
        this.onDeleteFaults = this.onDeleteFaults.bind(this)
        this.onclose = this.onclose.bind(this)
        this.OnUpdate = this.OnUpdate.bind(this)
    }
     refreshData() {
        this.setState({...this.state, is_loading:true},async ()=>{
            try {
                const response = await axios.get(url + '/api/v2/faults-read/', {
                  headers: {
                    'Authorization': "Token " + this.context.state.token
                  }
                });
                const response2 = await axios.get(url + '/api/v1/assets/', {
                    headers: {
                      'Authorization': "Token " + this.context.state.token
                    }
                  });
                this.setState({...this.state, faults_data:response.data,assets:response2.data})
              } catch (error) {
                  
                  toast.error("出现问题！请重试。提示：" + error.response.data['detail']);
              //   toast.error("Please check all the info below and try again");
              } finally {
                this.setState({ is_loading: false });
              }
        })

    }
    deleteData() {
        var tempthis= this
        this.setState({...this.state, is_loading:true},async ()=>{
            try {
                this.state.faults_to_delete.forEach(async (element) => {
                    try {
                        await axios.delete(url+ '/api/v2/faults/'+ element + '/', {
                          headers: {
                            'Authorization': "Token " + this.context.state.token
                          }
                          
                        });
                    } catch (error) {
                        
                        toast.error("出现问题！请重试。提示：" + error.response.data['detail']);
                      
                    } finally {
                        tempthis.refreshData()
                    }
                    
                });

                toast.success("Faults deleted");
                
                
                
                
            } catch (error) {
                this.setState({ is_loading: false },()=>{
                    this.refreshData()
                });
                toast.error("出现问题！请重试。提示：" + error);
               
                
            }   
           
        })

    }
    async componentDidMount() {

        this.refreshData()

    }
    OnUpdate() {

        this.refreshData()

    }
    deleteFaults(assets) {
        this.setState({...this.state,delete_form:true, faults_to_delete:assets})
    }
    async onDeleteFaults() {
        this.setState({...this.state,delete_form:false,is_loading:true},()=>{
         this.deleteData()
           
            
            
        })
    }
    onclose() {
        this.setState({...this.state,delete_form:false})
    }
    render() {
       
        const breadcrumbs = [

            <RouterLink
        to={'/'}
        replace={true}

    >
        Home
    </RouterLink>,
            <Typography key="65cvc463" color="text.primary">
                Faults table
            </Typography>,
        ];
        return (
            <>
                {this.state.delete_form && 
                <FaultsDelete handleClose={this.onclose} 
                HandleConfirm={this.onDeleteFaults} 
                AssetsToDelete = {this.state.faults_to_delete.length}
                ></FaultsDelete> }
                <ToastContainer></ToastContainer>

                <div className='content-wrapper'>
                    <div className='content-header'>
                        <Stack spacing={2} justifyContent={'space-between'} direction="row" sx={{mb:2,p:1}}>
                            <FmdBadIcon/>
                            <Breadcrumbs separator="›" aria-label="breadcrumb">
                                {breadcrumbs}
                            </Breadcrumbs>

                        </Stack>
                    </div>


                    <div className='container-fluid'>
                        <Backdrop
                            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                            open={this.state.is_loading}
                        >
                            <CircularProgress />
                        </Backdrop>
                      
                      

                        <EnhancedTable rows={this.state.faults_data} 
                                       handleDelete={this.deleteFaults}
                                       OnUpdate = {this.OnUpdate}
                                       assets={this.state.assets}
                                       ></EnhancedTable>
                        

                    </div>
                </div>
            </>
        );
    }
}
FaultsTable.contextType = AuthContext;
export default FaultsTable;