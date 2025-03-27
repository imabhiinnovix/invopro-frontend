import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../storeHooks';
import { fetchDashboardList } from './dashboardActions';
import { DashboardView } from './components/DashboardView';
import { toast } from 'react-toastify';
import axiosInstance from '../../services/axiosInstance';
import { POST } from '../../services/apiRoutes';

export const Dashboard = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const dashboards = useAppSelector((state) => state.dashboard.dashboards);
  const currentDashboard = dashboards.find((d) => d._id === id);

  useEffect(() => {
    if (!dashboards.length) {
      dispatch(fetchDashboardList());
    }
  }, [dispatch, dashboards.length]);

  const handleTitleChange = async (newTitle: string) => {
    try {
      await axiosInstance.post(`${POST.UPDATE_DASHBOARD}/${id}`, { name: newTitle });
      dispatch(fetchDashboardList());
      toast.success('Dashboard name updated successfully!');
    } catch (error) {
      console.error('Failed to update dashboard name:', error);
      toast.error('Failed to update dashboard name. Please try again.');
    }
  };

  const handleCreateWidget = () => {
    // TODO: Implement widget creation
    toast.info('Widget creation coming soon!');
  };

  if (!currentDashboard) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardView
      title={currentDashboard.name}
      onTitleChange={handleTitleChange}
      onCreateWidget={handleCreateWidget}
    />
  );
}; 