import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TeamOverview from '@/components/TeamOverview';
import axios from '@/lib/axios';

interface Project {
  _id: string;
  name: string;
  status: string;
}

interface Assignment {
  _id: string;
  engineerId: string;
  projectId: string;
  status: string;
  startDate: string;
  endDate: string;
  role: string;
  allocationPercentage: number;
}

interface EngineerAssignments {
  current: Assignment[];
  upcoming: Assignment[];
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: {
      total: 0,
      active: 0,
      planning: 0,
      completed: 0
    },
    assignments: {
      total: 0,
      active: 0
    },
    engineers: {
      total: 0
    }
  });
  const [engineerAssignments, setEngineerAssignments] = useState<EngineerAssignments>({
    current: [],
    upcoming: []
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, assignmentsRes, engineersRes] = await Promise.all([
          axios.get('/projects'),
          axios.get('/assignments'),
          axios.get('/engineers')
        ]);

        const projects = projectsRes.data;
        const assignments = assignmentsRes.data;
        const engineers = engineersRes.data;

        setProjects(projects);

        // Set general stats
        setStats({
          projects: {
            total: projects.length,
            active: projects.filter((p: Project) => p.status === 'active').length,
            planning: projects.filter((p: Project) => p.status === 'planning').length,
            completed: projects.filter((p: Project) => p.status === 'completed').length
          },
          assignments: {
            total: assignments.length,
            active: assignments.filter((a: Assignment) => a.status !== 'completed').length
          },
          engineers: {
            total: engineers.length
          }
        });

        // Process engineer assignments if user is an engineer
        if (user?.role === 'engineer') {
          const now = new Date();
          const myAssignments = assignments.filter((a: Assignment) => a.engineerId === user._id);
          
          const current = myAssignments.filter((a: Assignment) => {
            const startDate = new Date(a.startDate);
            const endDate = new Date(a.endDate);
            return startDate <= now && endDate >= now;
          });

          const upcoming = myAssignments.filter((a: Assignment) => {
            const startDate = new Date(a.startDate);
            return startDate > now;
          });

          setEngineerAssignments({
            current,
            upcoming
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    return project?.name || 'Unknown Project';
  };

  const renderEngineerDashboard = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Current Projects</CardTitle>
          <CardDescription>Your active assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engineerAssignments.current.length > 0 ? (
              engineerAssignments.current.map(assignment => (
                <div key={assignment._id} className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-lg font-semibold text-blue-700">
                        {getProjectName(assignment.projectId)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Role: {assignment.role}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {assignment.allocationPercentage}% Allocated
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No current assignments
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Assignments</CardTitle>
          <CardDescription>Your future project assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engineerAssignments.upcoming.length > 0 ? (
              engineerAssignments.upcoming.map(assignment => (
                <div key={assignment._id} className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-lg font-semibold text-green-700">
                        {getProjectName(assignment.projectId)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Role: {assignment.role}</div>
                      <div className="text-sm text-gray-600">
                        Starts: {new Date(assignment.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {assignment.allocationPercentage}% Allocation
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No upcoming assignments
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.name}!</CardTitle>
          <CardDescription>Resource Management System Dashboard</CardDescription>
        </CardHeader>
      </Card>

      {user?.role === 'manager' ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Overview of your team and projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">Projects</div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold">{stats.projects.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active:</span>
                      <span className="font-semibold text-green-600">{stats.projects.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planning:</span>
                      <span className="font-semibold text-blue-600">{stats.projects.planning}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-semibold text-gray-600">{stats.projects.completed}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Assignments</div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-semibold">{stats.assignments.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active:</span>
                      <span className="font-semibold text-green-600">{stats.assignments.active}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">Team</div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Engineers:</span>
                      <span className="font-semibold">{stats.engineers.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Overview</CardTitle>
              <CardDescription>Current team allocation and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <TeamOverview />
            </CardContent>
          </Card>
        </>
      ) : renderEngineerDashboard()}
    </div>
  );
};

export default Dashboard; 