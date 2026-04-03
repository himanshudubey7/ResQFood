import { useState, useEffect } from 'react';
import { HiUsers, HiClipboardList, HiTruck, HiHeart, HiChartBar, HiShieldCheck } from 'react-icons/hi';
import { analyticsAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10b981', '#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsAPI.getOverview();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return null;

  const { overview, categoryDistribution, usersByRole, recentListings, topDonors } = data;

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-surface-900">Admin Dashboard</h1>
        <p className="text-surface-500 mt-2 text-base">Platform-wide metrics and monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 stagger-children">
        <StatCard icon={<HiUsers />} label="Total Users" value={overview.totalUsers} />
        <StatCard icon={<HiClipboardList />} label="Total Listings" value={overview.totalListings} />
        <StatCard icon={<HiHeart />} label="Meals Saved" value={overview.mealsSaved} trendUp trend="All time" />
        <StatCard icon={<HiTruck />} label="Deliveries" value={overview.completedPickups} />
        <StatCard icon={<HiShieldCheck />} label="Available Now" value={overview.availableListings} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
        {/* Recent Activity Bar Chart */}
        <Card padding="p-5 md:p-6">
          <h2 className="font-bold text-surface-900 mb-5">📈 Listings (Last 7 Days)</h2>
          {recentListings.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={recentListings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="Listings" />
                <Bar dataKey="quantity" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Quantity" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-surface-400 text-sm">No data yet</div>
          )}
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card padding="p-5 md:p-6">
          <h2 className="font-bold text-surface-900 mb-5">🍽️ Category Distribution</h2>
          {categoryDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="_id"
                  label={({ _id, count }) => `${_id}: ${count}`}
                  labelLine={false}
                >
                  {categoryDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-surface-400 text-sm">No data yet</div>
          )}
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7">
        {/* Users by Role */}
        <Card padding="p-5 md:p-6">
          <h2 className="font-bold text-surface-900 mb-5">👥 Users by Role</h2>
          <div className="space-y-4">
            {usersByRole.map((r) => (
              <div key={r._id} className="flex items-center gap-3">
                <div className="w-20 text-sm font-medium text-surface-600 capitalize">{r._id}</div>
                <div className="flex-1 bg-surface-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-primary-500 to-accent-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, (r.count / overview.totalUsers) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-surface-700 w-8 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Donors */}
        <Card padding="p-5 md:p-6">
          <h2 className="font-bold text-surface-900 mb-5">🏆 Top Donors</h2>
          {topDonors.length > 0 ? (
            <div className="space-y-3">
              {topDonors.map((d, i) => (
                <div key={d._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-gray-100 text-gray-700' :
                    i === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-surface-100 text-surface-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-surface-800 text-sm">{d.name}</p>
                    <p className="text-xs text-surface-500">{d.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-surface-800">{d.deliveries}</p>
                    <p className="text-xs text-surface-400">deliveries</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-surface-400 text-sm">No delivery data yet</div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
