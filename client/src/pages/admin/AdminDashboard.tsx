import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Activity,
  Heart,
  Scan,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import type { AdminStats } from '@shared/schema';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is admin
    const adminUserStr = localStorage.getItem('adminUser');
    if (!adminUserStr) {
      setLocation('/admin');
      return;
    }
    
    setAdminUser(JSON.parse(adminUserStr));
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setLocation('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-emerald-900 text-white p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">HyperDiaScan</h2>
          <p className="text-emerald-200 text-sm">Admin Portal</p>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === 'dashboard' ? 'bg-emerald-700' : 'hover:bg-emerald-800'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === 'users' ? 'bg-emerald-700' : 'hover:bg-emerald-800'
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === 'logs' ? 'bg-emerald-700' : 'hover:bg-emerald-800'
            }`}
          >
            <FileText className="w-5 h-5" />
            Activity Logs
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === 'settings' ? 'bg-emerald-700' : 'hover:bg-emerald-800'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-800 transition mt-auto absolute bottom-6 left-6 right-6"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Top Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'logs' && 'Activity Logs'}
              {activeTab === 'settings' && 'Settings'}
            </h1>
            <p className="text-gray-600 mt-1">Welcome back, {adminUser?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{adminUser?.name}</p>
              <p className="text-xs text-gray-500">{adminUser?.email}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 font-semibold">
                {adminUser?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Active users</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Scans</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalScans}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Scan className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Nutrition analyzed</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Diabetes Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.usersByCondition.diabetes}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hypertension Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.usersByCondition.hypertension}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.activityType === 'scan' ? 'bg-emerald-500' :
                        log.activityType === 'login' ? 'bg-blue-500' :
                        log.activityType === 'logout' ? 'bg-gray-500' :
                        'bg-amber-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.userEmail}</p>
                        <p className="text-xs text-gray-500 capitalize">{log.activityType.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleDateString()} at{' '}
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                      {log.riskResult && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          log.riskResult === 'safe' ? 'bg-green-100 text-green-700' :
                          log.riskResult === 'moderate' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {log.riskResult}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600">User management interface will be displayed here</p>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600">Activity logs viewer will be displayed here</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600">Settings panel will be displayed here</p>
          </div>
        )}
      </main>
    </div>
  );
}
