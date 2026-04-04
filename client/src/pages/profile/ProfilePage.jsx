import { useEffect, useMemo, useState } from 'react';
import { HiCamera, HiMail, HiPhone, HiLocationMarker, HiOfficeBuilding } from 'react-icons/hi';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { authAPI, usersAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const EditableTag = () => (
  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
    Editable
  </span>
);

const ReadOnlyTag = () => (
  <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-500 bg-surface-100 border border-surface-200 rounded px-2 py-0.5">
    Read-only
  </span>
);

const ProfilePage = ({ role = 'donor' }) => {
  const { updateUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    orgName: '',
    orgType: role === 'ngo' ? 'ngo' : 'restaurant',
    orgAddress: '',
    orgDescription: '',
    orgContactPhone: '',
    orgContactEmail: '',
    orgCapacity: '',
    orgNeedLevel: '',
  });

  const orgTypeOptions = useMemo(() => {
    if (role === 'ngo') return [{ value: 'ngo', label: 'NGO' }, { value: 'other', label: 'Other' }];

    return [
      { value: 'restaurant', label: 'Restaurant' },
      { value: 'farm', label: 'Farm' },
      { value: 'grocery', label: 'Grocery' },
      { value: 'other', label: 'Other' },
    ];
  }, [role]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getMe();
      const user = res.data;
      const org = user?.organizationId;

      setProfile(user);
      setAvatarPreview(user?.avatar || '');

      setForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.location?.address || '',
        orgName: org?.name || '',
        orgType: org?.type || (role === 'ngo' ? 'ngo' : 'restaurant'),
        orgAddress: org?.address || '',
        orgDescription: org?.description || '',
        orgContactPhone: org?.contactPhone || '',
        orgContactEmail: org?.contactEmail || user?.email || '',
        orgCapacity: org?.capacity ?? '',
        orgNeedLevel: org?.needLevel ?? '',
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('phone', form.phone);
      payload.append('location', JSON.stringify({ address: form.address }));

      if (avatarFile) payload.append('avatar', avatarFile);

      payload.append('orgName', form.orgName);
      payload.append('orgType', form.orgType);
      payload.append('orgAddress', form.orgAddress);
      payload.append('orgDescription', form.orgDescription);
      payload.append('orgContactPhone', form.orgContactPhone);
      payload.append('orgContactEmail', form.orgContactEmail);
      payload.append('orgCapacity', form.orgCapacity);
      payload.append('orgNeedLevel', form.orgNeedLevel);

      const res = await usersAPI.updateProfile(payload, true);
      const updated = res.data;

      setProfile(updated);
      updateUser(updated);
      setAvatarFile(null);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900">{role === 'ngo' ? 'NGO Profile' : 'Donor Profile'}</h1>
        <p className="text-surface-500 mt-1">All information is loaded from database and saved directly to your profile.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-6" padding="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-surface-200 bg-surface-50">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-surface-500">
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-surface-800">Profile Picture</p>
                <EditableTag />
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 font-semibold text-sm transition-colors">
                <HiCamera className="w-4 h-4" />
                Upload New Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
              <p className="text-xs text-surface-500">PNG/JPG up to 5MB.</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-5" padding="p-6 md:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-surface-900">Personal Information</h2>
            <EditableTag />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-surface-800 heading-font ml-1">Email</label>
                <ReadOnlyTag />
              </div>
              <Input value={form.email} icon={<HiMail />} disabled />
            </div>

            <Input
              label="Phone"
              icon={<HiPhone />}
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            />

            <Input
              label="Address"
              icon={<HiLocationMarker />}
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>
        </Card>

        <Card className="space-y-5" padding="p-6 md:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-surface-900">Organization Information</h2>
            <EditableTag />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Organization Name"
              icon={<HiOfficeBuilding />}
              value={form.orgName}
              onChange={(e) => setForm((prev) => ({ ...prev, orgName: e.target.value }))}
            />

            <div className="space-y-2">
              <label className="block text-sm font-bold text-surface-800 heading-font ml-1">Organization Type</label>
              <select
                value={form.orgType}
                onChange={(e) => setForm((prev) => ({ ...prev, orgType: e.target.value }))}
                className="w-full rounded-2xl border-2 border-surface-200 bg-surface-50/50 py-4 px-5 text-base font-medium text-surface-900 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
              >
                {orgTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <Input
              label="Organization Address"
              value={form.orgAddress}
              onChange={(e) => setForm((prev) => ({ ...prev, orgAddress: e.target.value }))}
            />

            <Input
              label="Organization Contact Email"
              value={form.orgContactEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, orgContactEmail: e.target.value }))}
            />

            <Input
              label="Organization Contact Phone"
              value={form.orgContactPhone}
              onChange={(e) => setForm((prev) => ({ ...prev, orgContactPhone: e.target.value }))}
            />

            <Input
              label="Description"
              value={form.orgDescription}
              onChange={(e) => setForm((prev) => ({ ...prev, orgDescription: e.target.value }))}
            />

            <Input
              label="Capacity"
              type="number"
              value={form.orgCapacity}
              onChange={(e) => setForm((prev) => ({ ...prev, orgCapacity: e.target.value }))}
            />

            <Input
              label="Need Level (1-10)"
              type="number"
              min={1}
              max={10}
              value={form.orgNeedLevel}
              onChange={(e) => setForm((prev) => ({ ...prev, orgNeedLevel: e.target.value }))}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" isLoading={saving}>
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
