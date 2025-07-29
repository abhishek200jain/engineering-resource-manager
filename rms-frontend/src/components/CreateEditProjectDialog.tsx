import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import axios from '../lib/axios';
import * as yup from 'yup';

const statusOptions = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const projectSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(3, 'Name must be at least 3 characters'),
  description: yup.string().max(500, 'Description must be at most 500 characters'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().required('End date is required').min(
    yup.ref('startDate'),
    'End date must be after start date'
  ),
  requiredSkills: yup.string().required('At least one skill is required'),
  teamSize: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : Number(originalValue)))
    .typeError('Team size must be a number')
    .required('Team size is required')
    .min(1, 'Team size must be at least 1'),
  status: yup.string().oneOf(['planning', 'active', 'completed'], 'Invalid status').required('Status is required'),
});

interface CreateEditProjectDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreated: () => void;
  initialValues?: any;
  mode?: 'create' | 'edit';
}

const CreateEditProjectDialog: React.FC<CreateEditProjectDialogProps> = ({ open, setOpen, onCreated, initialValues, mode = 'create' }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    requiredSkills: '',
    teamSize: 1,
    status: 'planning',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || '',
        description: initialValues.description || '',
        startDate: initialValues.startDate ? initialValues.startDate.slice(0, 10) : '',
        endDate: initialValues.endDate ? initialValues.endDate.slice(0, 10) : '',
        requiredSkills: Array.isArray(initialValues.requiredSkills) ? initialValues.requiredSkills.join(', ') : '',
        teamSize: initialValues.teamSize || 1,
        status: initialValues.status || 'planning',
      });
    } else {
      setForm({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        requiredSkills: '',
        teamSize: 1,
        status: 'planning',
      });
    }
  }, [initialValues, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    });
    setFieldErrors({ ...fieldErrors, [name]: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    try {
      await projectSchema.validate(form, { abortEarly: false });
      if (mode === 'edit' && initialValues && initialValues._id) {
        await axios.put(`/projects/${initialValues._id}`, {
          name: form.name,
          description: form.description,
          startDate: form.startDate,
          endDate: form.endDate,
          requiredSkills: form.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
          teamSize: Number(form.teamSize),
          status: form.status,
        });
      } else {
        await axios.post('/projects', {
          name: form.name,
          description: form.description,
          startDate: form.startDate,
          endDate: form.endDate,
          requiredSkills: form.requiredSkills.split(',').map((s: string) => s.trim()).filter(Boolean),
          teamSize: Number(form.teamSize),
          status: form.status,
        });
      }
      setOpen(false);
      setForm({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        requiredSkills: '',
        teamSize: 1,
        status: 'planning',
      });
      onCreated();
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        const errors: { [key: string]: string } = {};
        err.inner.forEach((e: any) => {
          errors[e.path] = e.message;
        });
        setFieldErrors(errors);
      } else {
        setError(err?.response?.data?.message || 'Failed to save project');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Project' : 'Create Project'}</DialogTitle>
          <DialogDescription>Fill in the details to {mode === 'edit' ? 'edit' : 'create'} the project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Name<span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
            {fieldErrors.name && <div className="text-red-600 text-sm">{fieldErrors.name}</div>}
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            {fieldErrors.description && <div className="text-red-600 text-sm">{fieldErrors.description}</div>}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              {fieldErrors.startDate && <div className="text-red-600 text-sm">{fieldErrors.startDate}</div>}
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              {fieldErrors.endDate && <div className="text-red-600 text-sm">{fieldErrors.endDate}</div>}
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Required Skills <span className="text-xs text-gray-500">(comma separated)</span></label>
            <input name="requiredSkills" value={form.requiredSkills} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            {fieldErrors.requiredSkills && <div className="text-red-600 text-sm">{fieldErrors.requiredSkills}</div>}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Team Size</label>
              <input type="number" name="teamSize" value={form.teamSize} onChange={handleChange} className="w-full border rounded px-3 py-2" min={1} />
              {fieldErrors.teamSize && <div className="text-red-600 text-sm">{fieldErrors.teamSize}</div>}
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {fieldErrors.status && <div className="text-red-600 text-sm">{fieldErrors.status}</div>}
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save' : 'Create')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditProjectDialog; 