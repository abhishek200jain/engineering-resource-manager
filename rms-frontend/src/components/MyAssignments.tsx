import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from '../lib/axios';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { useAuth } from '../contexts/AuthContext';

interface Assignment {
  _id: string;
  engineerId: string;
  projectId: string;
  allocationPercentage: number;
  role: string;
  startDate: string;
  endDate: string;
}

// Project interface defines the structure of project data needed for assignments
interface Project { 
  _id: string;
  name: string;
  requiredSkills?: string[];
  status?: 'planning' | 'active' | 'completed';
}

// Status color mapping for different assignment states
const STATUS_COLORS = {
  Active: 'bg-green-100 text-green-800',
  Upcoming: 'bg-blue-100 text-blue-800',
  Completed: 'bg-gray-100 text-gray-800',
} as const;

const UTILIZATION_LEVELS = {
  overloaded: {
    threshold: 90,
    color: 'bg-red-500',
    text: 'Overloaded',
    description: 'Over 90% allocated'
  },
  high: {
    threshold: 70,
    color: 'bg-orange-500',
    text: 'High Load',
    description: '70-90% allocated'
  },
  optimal: {
    threshold: 30,
    color: 'bg-green-500',
    text: 'Optimal',
    description: '30-70% allocated'
  },
  underutilized: {
    threshold: 0,
    color: 'bg-yellow-500',
    text: 'Underutilized',
    description: 'Under 30% allocated'
  }
} as const;

// MyAssignments component displays assignments for the logged-in engineer
const MyAssignments: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch assignments and projects data
  const fetchData = useCallback(async () => {
    // Get the user ID (try both _id and id)
    const userId = user?._id || user?.id;
    if (!userId) {
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const [aRes, pRes] = await Promise.all([
        axios.get('/assignments'),
        axios.get('/projects'),
      ]);

      // Filter assignments for current engineer
      const engineerAssignments = aRes.data.filter((a: Assignment) => {
        return a.engineerId === userId;
      });

      setAssignments(engineerAssignments);
      setProjects(pRes.data);
    } catch (e) {
      console.error('Error details:', e);
      setError('Failed to load your assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized helper functions
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

  // Calculate total allocation for active assignments
  const totalAllocated = useMemo(() => 
    assignments
      .filter(a => getAssignmentStatus(a) === 'Active')
      .reduce((sum, a) => sum + a.allocationPercentage, 0)
  , [assignments, getAssignmentStatus]);

  // Get utilization status
  const utilizationStatus = useMemo(() => {
    if (totalAllocated >= UTILIZATION_LEVELS.overloaded.threshold) return UTILIZATION_LEVELS.overloaded;
    if (totalAllocated >= UTILIZATION_LEVELS.high.threshold) return UTILIZATION_LEVELS.high;
    if (totalAllocated <= UTILIZATION_LEVELS.optimal.threshold) return UTILIZATION_LEVELS.underutilized;
    return UTILIZATION_LEVELS.optimal;
  }, [totalAllocated]);

  // Group assignments by status
  const groupedAssignments = useMemo(() => {
    const groups = {
      Active: [] as Assignment[],
      Upcoming: [] as Assignment[],
      Completed: [] as Assignment[],
    };
    
    assignments.forEach(assignment => {
      const status = getAssignmentStatus(assignment);
      groups[status].push(assignment);
    });
    
    return groups;
  }, [assignments, getAssignmentStatus]);

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
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">My Assignments</h2>
        
        {/* Capacity Overview */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-700">Current Capacity</h3>
            <span className="text-sm text-gray-600">
              {totalAllocated}% allocated • {user?.maxCapacity ? user.maxCapacity - totalAllocated : 0}% available
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${utilizationStatus.color}`}
              style={{ width: `${Math.min(totalAllocated, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-500">
              Max capacity: {user?.maxCapacity || 100}%
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${utilizationStatus.color}`} />
              <span className="text-sm font-medium">{utilizationStatus.text}</span>
              <span className="text-xs text-gray-500">({utilizationStatus.description})</span>
            </div>
          </div>
        </div>

        {/* Assignment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(groupedAssignments).map(([status, items]) => (
            <div key={status} className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-blue-600">
                {items.length}
              </div>
              <div className="text-sm text-gray-600">{status} Projects</div>
            </div>
          ))}
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments yet</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't been assigned to any projects yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Skills Required</TableHead>
                <TableHead>Allocation %</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map(a => {
                const status = getAssignmentStatus(a);
                
                return (
                  <TableRow key={a._id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{getProjectName(a.projectId)}</TableCell>
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MyAssignments; 