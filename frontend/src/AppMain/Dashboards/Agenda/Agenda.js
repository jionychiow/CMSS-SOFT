import React, { Component } from "react";

import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { Backdrop, CircularProgress } from "@mui/material";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import DateRangeIcon from "@mui/icons-material/DateRange";
import MaintenanceViewerDrawer from "./MaintenanceViewerDrawer";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import AuthContext from "../../../AuthProvider/AuthContext";
import { url } from "../../../Config";

import MaintenancePlanForm from "./MaintenanceEditForm";

import { Link as RouterLink } from "react-router-dom";

class Agenda extends Component {
    constructor(props) {
        super(props);
        this.state = {
            is_loading: true,
            maintenances: [],
            assets: [],
            users: [],
            show_form: false,
            maintenance_plan: {}, // empty or plan object
            show_viewer: false,
            current_view_item: null
        };

        this.refreshData = this.refreshData.bind(this);
        this.handleOnEventEdit = this.handleOnEventEdit.bind(this);
        this.handleOnCellClick = this.handleOnCellClick.bind(this);
        this.handleOnDelete = this.handleOnDelete.bind(this);
        this.handleOnCloseForm = this.handleOnCloseForm.bind(this);
        this.handleOnUpdate = this.handleOnUpdate.bind(this);
    }

    async refreshData() {
        this.setState({ is_loading: true });

        try {
            const [mRes, aRes, uRes] = await Promise.all([
                axios.get(url + "/api/v1/maintenances/", {
                    headers: { Authorization: "Token " + this.context.state.token }
                }),
                axios.get(url + "/api/v1/assets/", {
                    headers: { Authorization: "Token " + this.context.state.token }
                }),
                axios.get(url + "/api/v1/profile-users/", {
                    headers: { Authorization: "Token " + this.context.state.token }
                })
            ]);

            this.setState({
                maintenances: mRes.data,
                assets: aRes.data,
                users: uRes.data
            });
        } catch (error) {
            toast.error("加载数据时出错: " + (error?.response?.data?.detail || error));
        } finally {
            this.setState({ is_loading: false });
        }
    }

    componentDidMount() {
        this.refreshData();
    }

    handleOnEventEdit(event) {

        const item = this.state.maintenances.find((m) => m.uuid === event.id);
        this.setState({
            maintenance_plan: item || {},
            show_form: true
        });
    }

    formatLocalDateTime(date) {
        // 获取本地时间的各部分并格式化为 'YYYY-MM-DD HH:mm:ss' 格式
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    handleOnCellClick(start, end) {
        start.setHours(start.getHours() + 2);
        end.setHours(end.getHours() + 2);

        this.setState({
            maintenance_plan: {
                uuid: "",
                planned_starting_date: this.formatLocalDateTime(start),
                planned_finished: this.formatLocalDateTime(end)
            },
            show_form: true
        });
    }

    async handleOnDelete(id) {
        this.setState({ is_loading: true });

        try {
            await axios.delete(url + "/api/v1/maintenances-plans/" + id + "/", {
                headers: { Authorization: "Token " + this.context.state.token }
            });

            toast.success("维护计划已删除。");
            this.refreshData();
        } catch (error) {
            toast.error("删除时出错: " + error);
        } finally {
            this.setState({ is_loading: false });
        }
    }

    handleOnCloseForm() {
        this.setState({ show_form: false });
    }

    handleOnUpdate() {
        this.setState({ show_form: false }, this.refreshData);
    }

    render() {
        const { maintenances, users, assets, maintenance_plan } = this.state;
        const events = maintenances.map((m, index) => ({
            id: m.uuid,
            title: m.name,
            start: new Date(m.planned_starting_date),
            end: new Date(m.planned_finished),
            color: {
                Cancelled: "error.main",
                Pending: "secondary.main",
                "In Progress": "info.main",
                Completed: "success.main"
            }[m.status],
            description: `资产: ${m.asset?.name}\n分配给: ${m.assigned_to?.username}`
        }));

        const breadcrumbs = [
            <RouterLink to={"/"} replace={true}>
                首页
            </RouterLink>,
            <Typography key="agenda-breadcrumb" color="text.primary">
                日程安排
            </Typography>
        ];

        return (
            <>
                <ToastContainer />

                {/* GLOBAL BACKDROP */}
                <Backdrop
                    sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={this.state.is_loading}
                >
                    <CircularProgress />
                </Backdrop>


                <div className="content-wrapper">
                    <div className="content-header">
                        <Stack
                            spacing={2}
                            direction="row"
                            justifyContent={"space-between"}
                            sx={{ mb: 2, p: 1 }}
                        >
                            <DateRangeIcon />
                            <Breadcrumbs separator="›">{breadcrumbs}</Breadcrumbs>
                        </Stack>
                    </div>

                    <div className="container-fluid">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={events.map(event => ({
                                id: event.id,
                                title: event.title,
                                start: event.start,
                                end: event.end,
                                backgroundColor: event.color,
                                extendedProps: {
                                    description: event.description
                                }
                            }))}
                            timeZone="CET"
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            eventClick={(event) => {
                                const item = this.state.maintenances.find((m) => m.uuid === event.event.id);
                                this.setState({
                                    show_viewer: true,
                                    current_view_item: item
                                });
                            }}
                            select={(selection) => {
                                this.handleOnCellClick(selection.start, selection.end);
                            }}
                            eventContent={(eventInfo) => (
                                <div style={{ color: 'white' }}>
                                    {eventInfo.event.title}
                                </div>
                            )}
                        />
                    </div>
                </div>

                {/* 🔥 DRAWER IS OUTSIDE THE SCHEDULER (correct placement) */}
                <MaintenancePlanForm
                    show={this.state.show_form}
                    handleClose={this.handleOnCloseForm}
                    maintenancePlan={maintenance_plan}
                    users={users}
                    assets={assets}
                    OnUpdate={this.handleOnUpdate}
                />
                <MaintenanceViewerDrawer
                    open={this.state.show_viewer}
                    maintenance={this.state.current_view_item}
                    onClose={() => this.setState({ show_viewer: false })}
                    assets={assets}
                    users={users}
                />
            </>

        );
    }
}

Agenda.contextType = AuthContext;
export default Agenda;
