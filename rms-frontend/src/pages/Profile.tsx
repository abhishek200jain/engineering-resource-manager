import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import axios from '../lib/axios';
import * as yup from 'yup';

const profileSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  skills: yup.string().when('role', {
    is: 'engineer',
    then: (schema) => schema.required('At least one skill is required'),
    otherwise: (schema) => schema.optional(),
  })
});

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');
    setFieldErrors({});
    try {
      await profileSchema.validate(form, { abortEarly: false });
      
      const updateData: any = {
        name: form.name,
      };
      
      if (user.role === 'engineer') {
        updateData.skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      }
      
      await axios.put('/auth/profile', updateData);
      setIsEditDialogOpen(false);
      window.location.reload();
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        const errors: { [key: string]: string } = {};
        err.inner.forEach((e: any) => {
          errors[e.path] = e.message;
        });
        setFieldErrors(errors);
      } else {
        setError(err?.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Profile</h1>
        {user?.role === 'engineer' && (
          <Button 
            onClick={() => setIsEditDialogOpen(true)}
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Edit Profile
          </Button>
        )}
      </div>

      <div className="flex items-start gap-8">
        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-5xl font-semibold text-blue-600">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-500 mb-2">{user.email}</p>
          <Badge variant="secondary" className="capitalize">
            {user.role}
          </Badge>
        </div>

        {/* Profile Info Sections */}
        <div className="flex-1 grid grid-cols-2 gap-6">
          {/* Personal Info Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Personal Info</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 block">Name</label>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 block">Email</label>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Work Info Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Work Info</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 block">Role</label>
                <p className="font-medium text-gray-900 capitalize">{user.role}</p>
              </div>
              {user.role === 'engineer' && (
                <>
                  <div>
                    <label className="text-sm text-gray-500 block">Seniority</label>
                    <p className="font-medium text-gray-900 capitalize">{user.seniority || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block">Department</label>
                    <p className="font-medium text-gray-900">{user.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block">Employment Type</label>
                    <p className="font-medium text-gray-900">
                      {user.maxCapacity === 100 ? 'Full-time' : user.maxCapacity === 50 ? 'Part-time' : `${user.maxCapacity}%`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block">Max Capacity</label>
                    <p className="font-medium text-gray-900">{user.maxCapacity}%</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Skills Section - Only for Engineers */}
          {user.role === 'engineer' && user.skills && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Name<span className="text-red-500">*</span>
              </label>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.name && <div className="text-red-600 text-sm mt-1">{fieldErrors.name}</div>}
            </div>
            {user.role === 'engineer' && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Skills <span className="text-xs text-gray-500">(comma separated)</span>
                  <span className="text-red-500">*</span>
                </label>
                <input 
                  name="skills" 
                  value={form.skills} 
                  onChange={handleChange} 
                  placeholder="React, Node.js, Python"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {fieldErrors.skills && <div className="text-red-600 text-sm mt-1">{fieldErrors.skills}</div>}
              </div>
            )}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)} 
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile; 