import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import axios from '../lib/axios';
import * as yup from 'yup';

const assignmentSchema = yup.object().shape({
  engineerId: yup.string().required('Engineer is required'),
  projectId: yup.string().required('Project is required'),
  allocationPercentage: yup.number().required('Allocation % is required').min(1).max(100),
  role: yup.string().required('Role is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().required('End date is required').min(yup.ref('startDate'), 'End date must be after start date'),
});

interface Engineer { _id: string; name: string; }
interface Project { _id: string; name: string; }

interface CreateEditAssignmentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSaved: () => void;
  initialValues?: any;
  mode?: 'create' | 'edit';
}

const CreateEditAssignmentDialog: React.FC<CreateEditAssignmentDialogProps> = ({ open, setOpen, onSaved, initialValues, mode = 'create' }) => {
  const [form, setForm] = useState({
    engineerId: '',
    projectId: '',
    allocationPercentage: 1,
    role: '',
    startDate: '',
    endDate: '',
  });
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    axios.get('/engineers').then(res => setEngineers(res.data));
    axios.get('/projects').then(res => setProjects(res.data));
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm({
        engineerId: initialValues.engineerId || '',
        projectId: initialValues.projectId || '',
        allocationPercentage: initialValues.allocationPercentage || 1,
        role: initialValues.role || '',
        startDate: initialValues.startDate ? initialValues.startDate.slice(0, 10) : '',
        endDate: initialValues.endDate ? initialValues.endDate.slice(0, 10) : '',
      });
    } else {
      setForm({
        engineerId: '',
        projectId: '',
        allocationPercentage: 1,
        role: '',
        startDate: '',
        endDate: '',
      });
    }
  }, [initialValues, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      await assignmentSchema.validate(form, { abortEarly: false });
      if (mode === 'edit' && initialValues && initialValues._id) {
        await axios.put(`/assignments/${initialValues._id}`, form);
      } else {
        await axios.post('/assignments', form);
      }
      setOpen(false);
      onSaved();
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        const errors: { [key: string]: string } = {};
        err.inner.forEach((e: any) => {
          errors[e.path] = e.message;
        });
        setFieldErrors(errors);
      } else {
        setError(err?.response?.data?.message || 'Failed to save assignment');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
          <DialogDescription>Fill in the details to {mode === 'edit' ? 'edit' : 'create'} the assignment.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Engineer<span className="text-red-500">*</span></label>
            <select name="engineerId" value={form.engineerId} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select engineer</option>
              {engineers.map(e => (
                <option key={e._id} value={e._id}>{e.name}</option>
              ))}
            </select>
            {fieldErrors.engineerId && <div className="text-red-600 text-sm">{fieldErrors.engineerId}</div>}
          </div>
          <div>
            <label className="block font-medium mb-1">Project<span className="text-red-500">*</span></label>
            <select name="projectId" value={form.projectId} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">Select project</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            {fieldErrors.projectId && <div className="text-red-600 text-sm">{fieldErrors.projectId}</div>}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Allocation %<span className="text-red-500">*</span></label>
              <input type="number" name="allocationPercentage" value={form.allocationPercentage} onChange={handleChange} className="w-full border rounded px-3 py-2" min={1} max={100} />
              {fieldErrors.allocationPercentage && <div className="text-red-600 text-sm">{fieldErrors.allocationPercentage}</div>}
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">Role<span className="text-red-500">*</span></label>
              <input name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              {fieldErrors.role && <div className="text-red-600 text-sm">{fieldErrors.role}</div>}
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Start Date<span className="text-red-500">*</span></label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              {fieldErrors.startDate && <div className="text-red-600 text-sm">{fieldErrors.startDate}</div>}
            </div>
            <div className="flex-1">
              <label className="block font-medium mb-1">End Date<span className="text-red-500">*</span></label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              {fieldErrors.endDate && <div className="text-red-600 text-sm">{fieldErrors.endDate}</div>}
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

export default CreateEditAssignmentDialog; 