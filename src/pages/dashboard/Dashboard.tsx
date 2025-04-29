import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../storeHooks';
import { fetchDashboardList } from './dashboardActions';
import { DashboardView } from './components/DashboardView';
import { toast } from 'react-toastify';
import axiosInstance from '../../services/axiosInstance';
import { POST } from '../../services/apiRoutes';
import { Dashboard as DashboardType } from './types';

export const Dashboard = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { dashboards } = useAppSelector((state) => ({
    dashboards: state.dashboard.dashboards || [],
  }));
  const currentDashboard = dashboards.find((d: DashboardType) => d._id === id);

  useEffect(() => {
    if (!dashboards.length) {
      dispatch(fetchDashboardList());
    }
  }, [dispatch, dashboards.length]);

  const handleTitleChange = async (newTitle: string) => {
    try {
      await axiosInstance.post(`${POST.UPDATE_DASHBOARD}/${id}`, { name: newTitle });
      const result = await dispatch(fetchDashboardList()).unwrap();
      if (result.success) {
        toast.success('Dashboard name updated successfully!');
      } else {
        toast.error(result.message || 'Failed to update dashboard name');
      }
    } catch (error) {
      console.error('Failed to update dashboard name:', error);
      toast.error('Failed to update dashboard name. Please try again.');
    }
  };

  if (!currentDashboard) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardView
      title={currentDashboard.name}
      onTitleChange={handleTitleChange}
    />
  );
}; 