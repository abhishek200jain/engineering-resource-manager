import React, { useEffect, useState, useCallback } from 'react';
import axios from '../lib/axios';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import CreateEditProjectDialog from './CreateEditProjectDialog';
import { useAuth } from '../contexts/AuthContext';
import { Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import NotAuthorized from '../pages/NotAuthorized';

// Project interface defines the structure of a project in the system
interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  teamSize: number;
  status: 'planning' | 'active' | 'completed';
  managerId?: string;
}

// Define colors for different project statuses
const STATUS_COLORS = {
  planning: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-200 text-gray-800',
} as const;

// Projects component handles project management functionality
// Only accessible to managers
const Projects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Security check - only managers should access this component
  if (user?.role !== 'manager') {
    return <NotAuthorized />;
  }

  // Memoized fetch function to avoid recreating on every render
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/projects');
      setProjects(res.data);
    } catch (e) {
      console.error('Error fetching projects:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects by status
  const filteredProjects = statusFilter
    ? projects.filter(project => project.status === statusFilter)
    : projects;

  // Memoized handlers to avoid recreating on every render
  const handleCreateProject = useCallback(async () => {
    setCreateOpen(false);
    await fetchProjects();
  }, [fetchProjects]);

  const handleEditProject = useCallback(async () => {
    setEditProject(null);
    await fetchProjects();
  }, [fetchProjects]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    try {
      await axios.delete(`/projects/${projectId}`);
      setDeleteProject(null);
      await fetchProjects();
    } catch (e) {
      console.error('Error deleting project:', e);
    }
  }, [fetchProjects]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Projects</h2>
        <div className="flex gap-4">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" 
            onClick={() => setCreateOpen(true)}
          >
            Create Project
          </button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter ? 'No projects found with the selected status.' : 'Get started by creating a new project.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Required Skills</TableHead>
                <TableHead>Team Size</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map(project => (
                <TableRow
                  key={project._id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelected(project)}
                >
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell className="max-w-md truncate">{project.description}</TableCell>
                  <TableCell>
                    <span className={`capitalize px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[project.status]}`}>
                      {project.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.requiredSkills.map(skill => (
                        <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{project.teamSize}</TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors" 
                        title="Edit" 
                        onClick={() => setEditProject(project)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        className="p-1 text-red-600 hover:text-red-800 transition-colors" 
                        title="Delete" 
                        onClick={() => setDeleteProject(project)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Project Details Modal */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>{selected.name}</DialogTitle>
                <button
                  onClick={() => setSelected(null)}
                  className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-gray-700">{selected.description}</div>
              <div className="text-sm text-gray-500">
                {new Date(selected.startDate).toLocaleDateString()} - {new Date(selected.endDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Status: </span>
                <span className={`capitalize px-2 py-1 rounded text-xs font-medium ${STATUS_COLORS[selected.status]}`}>
                  {selected.status}
                </span>
              </div>
              <div>
                <span className="font-medium">Required Skills:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selected.requiredSkills.map(skill => (
                    <span key={skill} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium">Team Size:</span> {selected.teamSize}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Project Dialog */}
      <CreateEditProjectDialog
        open={createOpen}
        setOpen={setCreateOpen}
        onCreated={handleCreateProject}
        mode="create"
      />

      {/* Edit Project Dialog */}
      {editProject && (
        <CreateEditProjectDialog
          open={!!editProject}
          setOpen={(open) => !open && setEditProject(null)}
          onCreated={handleEditProject}
          initialValues={editProject}
          mode="edit"
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteProject && (
        <Dialog open={!!deleteProject} onOpenChange={(open) => !open && setDeleteProject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
            </DialogHeader>
            <div>
              Are you sure you want to delete <span className="font-medium">{deleteProject.name}</span>?
              <div className="text-sm text-gray-500 mt-1">This action cannot be undone.</div>
            </div>
            <DialogFooter>
              <button 
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors" 
                onClick={() => setDeleteProject(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                onClick={() => handleDeleteProject(deleteProject._id)}
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

export default Projects; 