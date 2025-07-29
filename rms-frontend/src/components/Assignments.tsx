import React, { useEffect, useState, useCallback } from 'react';
import axios from '../lib/axios';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CreateEditAssignmentDialog from './CreateEditAssignmentDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import NotAuthorized from '../pages/NotAuthorized';

interface Assignment {
  _id: string;
  engineerId: string;
  projectId: string;
  allocationPercentage: number;
  role: string;
  startDate: string;
  endDate: string;
}

interface Engineer { 
  _id: string; 
  name: string; 
  skills?: string[];
  maxCapacity?: number;
}

interface Project { 
  _id: string; 
  name: string; 
  requiredSkills?: string[];
  status?: 'planning' | 'active' | 'completed';
}

const STATUS_COLORS = {
  Active: 'bg-green-100 text-green-800',
  Upcoming: 'bg-blue-100 text-blue-800',
  Completed: 'bg-gray-100 text-gray-800',
} as const;

const Assignments: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
  const [deleteAssignment, setDeleteAssignment] = useState<Assignment | null>(null);

  // Security check - only managers should access this component
  if (user?.role !== 'manager') {
    return <NotAuthorized />;
  }

  // Memoized fetch function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [aRes, eRes, pRes] = await Promise.all([
        axios.get('/assignments'),
        axios.get('/engineers'),
        axios.get('/projects'),
      ]);
      setAssignments(aRes.data);
      setEngineers(eRes.data);
      setProjects(pRes.data);
    } catch (e) {
      setError('Failed to load assignments. Please try again.');
      console.error('Error fetching assignments:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized helper functions
  const getEngineerName = useCallback((id: string) => 
    engineers.find(e => e._id === id)?.name || 'Unknown Engineer'
  , [engineers]);

  const getProjectName = useCallback((id: string) => 
    projects.find(p => p._id === id)?.name || 'Unknown Project'
  , [projects]);

  const getProjectSkills = useCallback((id: string) => 
    projects.find(p => p._id === id)?.requiredSkills || []
  , [projects]);

  // Calculate assignment status
  const getAssignmentStatus = useCallback((assignment: Assignment) => {
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);
    
    if (now < startDate) return 'Upcoming';
    if (now > endDate) return 'Completed';
    return 'Active';
  }, []);

  // Memoized handlers
  const handleCreateAssignment = useCallback(async () => {
    setCreateOpen(false);
    await fetchData();
  }, [fetchData]);

  const handleEditAssignment = useCallback(async () => {
    setEditAssignment(null);
    await fetchData();
  }, [fetchData]);

  const handleDeleteAssignment = useCallback(async (assignmentId: string) => {
    try {
      await axios.delete(`/assignments/${assignmentId}`);
      setDeleteAssignment(null);
      await fetchData();
    } catch (e) {
      setError('Failed to delete assignment. Please try again.');
      console.error('Error deleting assignment:', e);
    }
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <div className="mb-2">⚠️</div>
        <div>{error}</div>
        <button 
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Assignments</h2>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" 
          onClick={() => setCreateOpen(true)}
        >
          Create Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new assignment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Engineer</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Allocation %</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map(a => {
                const status = getAssignmentStatus(a);
                
                return (
                  <TableRow key={a._id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{getEngineerName(a.engineerId)}</TableCell>
                    <TableCell>{getProjectName(a.projectId)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getProjectSkills(a.projectId).map(skill => (
                          <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${a.allocationPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{a.allocationPercentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{a.role}</TableCell>
                    <TableCell>{new Date(a.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(a.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[status]}`}>
                        {status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button 
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors" 
                          title="Edit" 
                          onClick={() => setEditAssignment(a)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          className="p-1 text-red-600 hover:text-red-800 transition-colors" 
                          title="Delete" 
                          onClick={() => setDeleteAssignment(a)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Assignment Dialog */}
      <CreateEditAssignmentDialog
        open={createOpen}
        setOpen={setCreateOpen}
        onSaved={handleCreateAssignment}
        mode="create"
      />

      {/* Edit Assignment Dialog */}
      {editAssignment && (
        <CreateEditAssignmentDialog
          open={!!editAssignment}
          setOpen={(open) => !open && setEditAssignment(null)}
          onSaved={handleEditAssignment}
          initialValues={editAssignment}
          mode="edit"
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteAssignment && (
        <Dialog open={!!deleteAssignment} onOpenChange={(open) => !open && setDeleteAssignment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Assignment</DialogTitle>
            </DialogHeader>
            <div>
              Are you sure you want to delete the assignment for{' '}
              <span className="font-medium">{getEngineerName(deleteAssignment.engineerId)}</span> on project{' '}
              <span className="font-medium">{getProjectName(deleteAssignment.projectId)}</span>?
              <div className="text-sm text-gray-500 mt-1">This action cannot be undone.</div>
            </div>
            <DialogFooter>
              <button 
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors" 
                onClick={() => setDeleteAssignment(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                onClick={() => handleDeleteAssignment(deleteAssignment._id)}
              >
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Assignments; 