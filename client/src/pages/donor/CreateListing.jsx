import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateListing } from '../../hooks/useListings';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { HiPhotograph, HiX } from 'react-icons/hi';

const categories = [
  { value: 'cooked_meals', label: '🍲 Cooked Meals' },
  { value: 'raw_vegetables', label: '🥬 Raw Vegetables' },
  { value: 'fruits', label: '🍎 Fruits' },
  { value: 'dairy', label: '🥛 Dairy' },
  { value: 'bakery', label: '🍞 Bakery' },
  { value: 'canned_goods', label: '🥫 Canned Goods' },
  { value: 'beverages', label: '🥤 Beverages' },
  { value: 'grains', label: '🌾 Grains' },
  { value: 'mixed', label: '📦 Mixed' },
  { value: 'other', label: '🍽️ Other' },
];

const units = [
  { value: 'servings', label: 'Servings' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'lbs', label: 'Pounds' },
  { value: 'packets', label: 'Packets' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'items', label: 'Items' },
];

const CreateListing = () => {
  const navigate = useNavigate();
  const createMutation = useCreateListing();
  const [photos, setPhotos] = useState([]);
  
  const [form, setForm] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 6); // Add 6 hours
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // Shift to local timezone
    return {
      title: '',
      description: '',
      quantity: '',
      unit: 'servings',
      category: 'cooked_meals',
      condition: 'fresh',
      address: '',
      lat: '',
      lng: '',
      expiryAt: d.toISOString().slice(0, 16),
      readyAt: '',
    };
  });

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setPhotos((prev) => [...prev, ...files].slice(0, 5));
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      // Don't append empty values
      if (value !== '' && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    try {
      await createMutation.mutateAsync(formData);
      navigate('/donor/listings');
    } catch {
      // error handled by hook
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900">Create Food Listing</h1>
        <p className="text-surface-500 mt-1">Share your surplus food with those in need</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-6">
          {/* Title */}
          <Input
            label="Title *"
            placeholder="e.g., Fresh Vegetable Biryani"
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
            required
          />

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Description</label>
            <textarea
              placeholder="Describe the food, packaging, special instructions..."
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-surface-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
            />
          </div>

          {/* Quantity + Unit */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity *"
              type="number"
              min="1"
              placeholder="50"
              value={form.quantity}
              onChange={(e) => updateForm('quantity', e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Unit</label>
              <select
                value={form.unit}
                onChange={(e) => updateForm('unit', e.target.value)}
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                {units.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category + Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Category *</label>
              <select
                value={form.category}
                onChange={(e) => updateForm('category', e.target.value)}
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-surface-700">Condition</label>
              <select
                value={form.condition}
                onChange={(e) => updateForm('condition', e.target.value)}
                className="w-full rounded-xl border border-surface-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="fresh">🟢 Fresh</option>
                <option value="near_expiry">🟡 Near Expiry</option>
                <option value="packaged">📦 Packaged</option>
              </select>
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-surface-700">Photos (up to 5)</label>
            <div className="flex flex-wrap gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-surface-200">
                  <img src={URL.createObjectURL(photo)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs cursor-pointer"
                  >
                    <HiX />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-surface-300 flex flex-col items-center justify-center text-surface-400 hover:text-primary-500 hover:border-primary-500 transition-colors cursor-pointer">
                  <HiPhotograph size={24} />
                  <span className="text-[10px] mt-1">Add</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Address */}
          <Input
            label="Pickup Address *"
            placeholder="Full address for pickup"
            value={form.address}
            onChange={(e) => updateForm('address', e.target.value)}
            required
          />

          {/* Lat/Lng */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              placeholder="19.0760"
              value={form.lat}
              onChange={(e) => updateForm('lat', e.target.value)}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              placeholder="72.8777"
              value={form.lng}
              onChange={(e) => updateForm('lng', e.target.value)}
            />
          </div>

          {/* Expiry & Ready */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry Date/Time *"
              type="datetime-local"
              value={form.expiryAt}
              onChange={(e) => updateForm('expiryAt', e.target.value)}
              required
            />
            <Input
              label="Ready for Pickup"
              type="datetime-local"
              value={form.readyAt}
              onChange={(e) => updateForm('readyAt', e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-surface-100">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1" size="lg">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" size="lg" isLoading={createMutation.isPending}>
              Create Listing
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateListing;
