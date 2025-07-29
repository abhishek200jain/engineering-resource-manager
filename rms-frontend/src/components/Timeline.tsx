import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from '../lib/axios';
import { Card } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { getAvailableCapacity } from '../lib/calculations';

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

// Engineer interface defines the structure of engineer data
interface Engineer {
  _id: string;
  name: string;
  maxCapacity: number;
  skills: string[];
}

// Project interface defines the basic project information
interface Project {
  _id: string;
  name: string;
}

// CalendarEvent interface defines the structure of timeline events
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    role: string;
    allocation: number;
    availableCapacity: number;
    usedCapacity: number;
    totalCapacity: number;
  };
  backgroundColor: string;
}

// Timeline component displays resource allocations in a calendar view
export default function Timeline() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const { user } = useAuth();

  // Fetch assignments, engineers, and projects data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignmentsRes, engineersRes, projectsRes] = await Promise.all([
          axios.get('/assignments'),
          axios.get('/engineers'),
          axios.get('/projects')
        ]);

        // Filter assignments if user is an engineer
        const filteredAssignments = user?.role === 'engineer' 
          ? assignmentsRes.data.filter((assignment: Assignment) => assignment.engineerId === user._id)
          : assignmentsRes.data;

        setAssignments(filteredAssignments);
        setEngineers(engineersRes.data);
        setProjects(projectsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  // Calculate color based on allocation percentage
  const getColorForAllocation = (percentage: number): string => {
    if (percentage <= 25) return '#4ade80'; // green-400
    if (percentage <= 50) return '#facc15'; // yellow-400
    if (percentage <= 75) return '#fb923c'; // orange-400
    return '#ef4444'; // red-400
  };

  const events: CalendarEvent[] = assignments
    .map(assignment => {
      const engineer = engineers.find(e => e._id === assignment.engineerId);
      const project = projects.find(p => p._id === assignment.projectId);
      
      if (!engineer || !project) return null;

      const availableCapacity = getAvailableCapacity(engineer, assignments);
      const totalCapacity = engineer.maxCapacity;
      const usedCapacity = totalCapacity - availableCapacity;
      
      return {
        id: assignment._id,
        title: user?.role === 'engineer'
          ? `${project.name} (${assignment.role})`
          : `${project.name} - ${engineer.name}`,
        start: assignment.startDate,
        end: assignment.endDate,
        extendedProps: {
          role: assignment.role,
          allocation: assignment.allocationPercentage,
          availableCapacity,
          usedCapacity,
          totalCapacity
        },
        backgroundColor: getColorForAllocation(assignment.allocationPercentage),
      };
    })
    .filter((event): event is CalendarEvent => event !== null);

  const renderEventContent = (eventInfo: any) => {
    const { allocation, availableCapacity, usedCapacity, totalCapacity } = eventInfo.event.extendedProps;
    
    return (
      <>
        <div className="font-semibold">{eventInfo.event.title}</div>
        <div className="text-sm space-y-1">
          {user?.role === 'engineer' ? (
            <>
              <div>This Assignment: {allocation}%</div>
              <div>Total Allocated: {usedCapacity}%</div>
              <div>Available: {availableCapacity}%</div>
            </>
          ) : (
            <>
              <div>{eventInfo.event.extendedProps.role}</div>
              <div>Allocation: {allocation}%</div>
              <div>Available: {availableCapacity}%</div>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {user?.role === 'engineer' ? 'My Assignments Timeline' : 'Assignment Timeline'}
      </h2>
      <div className="h-[600px]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventContent={renderEventContent}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
        />
      </div>
    </Card>
  );
} 