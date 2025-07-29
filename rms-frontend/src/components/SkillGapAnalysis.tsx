import { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { Card } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface Engineer {
  _id: string;
  name: string;
  skills: string[];
}

interface Project {
  _id: string;
  name: string;
  requiredSkills: string[];
  teamSize: number;
}

export default function SkillGapAnalysis() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [engineersRes, projectsRes] = await Promise.all([
          axios.get('/engineers'),
          axios.get('/projects')
        ]);
        setEngineers(engineersRes.data);
        setProjects(projectsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          Loading skill gap analysis...
        </div>
      </Card>
    );
  }

  // Analyze each project
  const analysis = projects.map(project => {
    // For each required skill in the project
    const skillsNeeded = project.requiredSkills.map(skill => {
      // Find all engineers who have this skill
      const engineersWithThisSkill = engineers.filter(engineer => 
        engineer.skills.includes(skill)
      );

      // Calculate if we need more engineers
      const haveEnough = engineersWithThisSkill.length >= project.teamSize;
      const needMore = project.teamSize - engineersWithThisSkill.length;

      return {
        skill: skill,
        engineersWhoHaveIt: engineersWithThisSkill.map(eng => eng.name),
        totalEngineers: engineersWithThisSkill.length,
        needMore: needMore > 0 ? needMore : 0,
        haveEnough
      };
    });

    return {
      projectName: project.name,
      teamSizeNeeded: project.teamSize,
      skillsNeeded
    };
  });

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Skill Gap Analysis</h2>
      <div className="space-y-8">
        {analysis.map(project => (
          <div key={project.projectName} className="border rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-2">{project.projectName}</h3>
            <p className="text-gray-600 mb-4">
              Team Size Needed: {project.teamSizeNeeded} engineers
            </p>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill Needed</TableHead>
                  <TableHead>Who Has This Skill?</TableHead>
                  <TableHead>Do We Have Enough?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.skillsNeeded.map(skill => (
                  <TableRow key={skill.skill}>
                    <TableCell className="font-medium">
                      {skill.skill}
                    </TableCell>
                    <TableCell>
                      <div>
                        {skill.engineersWhoHaveIt.join(', ')}
                        <div className="text-sm text-gray-500 mt-1">
                          Total: {skill.totalEngineers} engineers
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {skill.haveEnough ? (
                        <span className="text-green-500">
                          Yes, we have enough engineers
                        </span>
                      ) : (
                        <span className="text-red-500">
                          No, need {skill.needMore} more engineer{skill.needMore > 1 ? 's' : ''}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </Card>
  );
} 