import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { tasksApi } from '../../api/tasks';
import { TaskingMap } from './TaskingMap';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';
import type { Task } from '../../types';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [currentAOI, setCurrentAOI] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await tasksApi.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const handleAOIDrawn = (aoi: any) => {
    setCurrentAOI(aoi);
  };

  const handleTaskSubmit = async (taskData: any) => {
    setLoading(true);
    try {
      const newTask = await tasksApi.create(taskData);
      setTasks((prev) => [newTask, ...prev]);
      setCurrentAOI(null);

      // Simulate status update after 2 seconds
      setTimeout(async () => {
        await loadTasks();
      }, 2000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            SAR Tasking Platform
          </h1>
          <p className="text-sm text-slate-400">Synthetic Aperture Radar Mission Control</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-medium text-white">{user?.name}</div>
            <div className="text-xs text-slate-400">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-96 bg-slate-800 border-r border-slate-700 flex flex-col overflow-hidden shadow-xl">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Task Form */}
            <TaskForm currentAOI={currentAOI} onSubmit={handleTaskSubmit} loading={loading} />

            {/* Task List */}
            <TaskList tasks={tasks} />
          </div>
        </div>

        {/* Map */}
        <div className="flex-1">
          <TaskingMap onAOIDrawn={handleAOIDrawn} currentAOI={currentAOI} />
        </div>
      </div>
    </div>
  );
};
