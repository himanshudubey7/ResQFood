import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { HiSearch, HiShieldCheck, HiCheckCircle } from 'react-icons/hi';
import { formatDate, getRoleLabel, getRoleColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await usersAPI.getAll(params);
      setUsers(res.data || []);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleVerify = async (userId) => {
    try {
      await usersAPI.verify(userId);
      toast.success('User verified!');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to verify');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-surface-900">User Management</h1>
        <p className="text-surface-500 mt-2">{pagination.total || 0} registered users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-5">
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<HiSearch />}
          />
        </form>
        <div className="flex flex-wrap gap-2 md:gap-3">
          {['', 'donor', 'ngo', 'volunteer', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                roleFilter === r ? 'bg-primary-600 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'
              }`}
            >
              {r ? getRoleLabel(r) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? <PageLoader /> : (
        <Card padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  <th className="px-5 lg:px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase">User</th>
                  <th className="px-5 lg:px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase">Role</th>
                  <th className="px-5 lg:px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase">Status</th>
                  <th className="px-5 lg:px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase">Joined</th>
                  <th className="px-5 lg:px-6 py-4 text-right text-xs font-semibold text-surface-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                    <td className="px-5 lg:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-surface-800 text-sm">{user.name}</p>
                          <p className="text-xs text-surface-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      <Badge className={getRoleColor(user.role)} size="xs">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </td>
                    <td className="px-5 lg:px-6 py-4">
                      {user.isVerified ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <HiCheckCircle /> Verified
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Pending</span>
                      )}
                    </td>
                    <td className="px-5 lg:px-6 py-4 text-sm text-surface-500">{formatDate(user.createdAt)}</td>
                    <td className="px-5 lg:px-6 py-4 text-right">
                      {!user.isVerified && (
                        <Button size="sm" variant="outline" onClick={() => handleVerify(user._id)}>
                          <HiShieldCheck className="mr-1" /> Verify
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="py-12 text-center text-surface-400 text-sm">No users found</div>
          )}
        </Card>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="px-4 py-2 text-sm text-surface-500">Page {page} of {pagination.pages}</span>
          <Button variant="secondary" size="sm" disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
