import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import NotAuthorized from '../pages/NotAuthorized';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';

// Engineer interface defines the structure of an engineer's data
interface Engineer {
  _id: string;
  name: string;
  skills: string[];
  seniority: 'junior' | 'mid' | 'senior';
  department: string;
  maxCapacity: number;
}

// Assignment interface defines the structure of project assignments
interface Assignment {
  _id: string;
  engineerId: string;
  projectId: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  role: string;
}

// Project interface defines the basic project information needed for team overview
interface Project {
  _id: string;
  name: string;
  status: 'planning' | 'active' | 'completed';
}

// TeamOverview component shows team allocation and project assignments
// Only accessible to managers
const TeamOverview: React.FC = () => {
  const { user } = useAuth();
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Security check - only managers should access this component
  if (user?.role !== 'manager') {
    return <NotAuthorized />;
  }

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [engRes, asgRes, projRes] = await Promise.all([
        axios.get('/engineers'),
        axios.get('/assignments'),
        axios.get('/projects'),
      ]);
      setEngineers(engRes.data);
      setAssignments(asgRes.data);
      setProjects(projRes.data);
    } catch (e) {
      setError('Failed to load team data. Please try again.');
      console.error('Error fetching team data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get all departments for filter
  const departments = useMemo(() => 
    Array.from(new Set(engineers.map(eng => eng.department))).sort()
  , [engineers]);

  // Calculate current allocation for an engineer
  const getEngineerAllocation = useCallback((engineerId: string) => {
    const now = new Date();
    const activeAssignments = assignments.filter(a => {
      const startDate = new Date(a.startDate);
      const endDate = new Date(a.endDate);
      return (
        a.engineerId === engineerId &&
        now >= startDate &&
        now <= endDate
      );
    });

    return activeAssignments.reduce((sum, a) => sum + a.allocationPercentage, 0);
  }, [assignments]);

  // Get current projects for an engineer
  const getEngineerProjects = useCallback((engineerId: string) => {
    const now = new Date();
    return assignments
      .filter(a => {
        const startDate = new Date(a.startDate);
        const endDate = new Date(a.endDate);
        return (
          a.engineerId === engineerId &&
          now >= startDate &&
          now <= endDate
        );
      })
      .map(a => {
        const project = projects.find(p => p._id === a.projectId);
        return {
          name: project?.name || 'Unknown Project',
          allocation: a.allocationPercentage,
          role: a.role
        };
      });
  }, [assignments, projects]);

  // Filter engineers
  const filteredEngineers = useMemo(() => {
    let filtered = engineers;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(eng => 
        eng.name.toLowerCase().includes(term) ||
        eng.department.toLowerCase().includes(term)
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(eng => eng.department === departmentFilter);
    }

    return filtered;
  }, [engineers, searchTerm, departmentFilter]);

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
        <h2 className="text-xl font-semibold">Team Overview</h2>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="appearance-none px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-blue-600">
            {engineers.length}
          </div>
          <div className="text-sm text-gray-600">Total Team Members</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-green-600">
            {engineers.filter(e => getEngineerAllocation(e._id) < 100).length}
          </div>
          <div className="text-sm text-gray-600">Available Engineers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-2xl font-bold text-orange-600">
            {engineers.filter(e => getEngineerAllocation(e._id) >= 100).length}
          </div>
          <div className="text-sm text-gray-600">Fully Allocated</div>
        </div>
      </div>

      {/* Team List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead>Current Projects</TableHead>
              <TableHead>Allocation</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEngineers.map(eng => {
              const allocation = getEngineerAllocation(eng._id);
              const currentProjects = getEngineerProjects(eng._id);
              
              return (
                <TableRow key={eng._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{eng.name}</TableCell>
                  <TableCell>{eng.department}</TableCell>
                  <TableCell className="capitalize">{eng.seniority}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {currentProjects.map((proj, idx) => (
                        <div key={idx} className="text-sm">
                          {proj.name} ({proj.allocation}%) - {proj.role}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            allocation >= 100 ? 'bg-red-500' :
                            allocation >= 70 ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(allocation, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{allocation}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      allocation >= 100 ? 'bg-red-100 text-red-800' :
                      allocation >= 70 ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {allocation >= 100 ? 'Overallocated' :
                       allocation >= 70 ? 'High Load' :
                       'Available'}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeamOverview;        