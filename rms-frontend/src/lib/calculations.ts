interface Engineer {
  _id: string;
  name: string;
  skills: string[];
  maxCapacity: number;
}

interface Assignment {
  engineerId: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
}

interface Project {
  _id: string;
  name: string;
  requiredSkills: string[];
}

export function getAvailableCapacity(
  engineer: Engineer,
  assignments: Assignment[]
): number {
  const activeAssignments = assignments.filter(assignment => {
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const endDate = new Date(assignment.endDate);
    return (
      assignment.engineerId === engineer._id &&
      startDate <= now &&
      endDate >= now
    );
  });

  const totalAllocated = activeAssignments.reduce(
    (sum, a) => sum + a.allocationPercentage,
    0
  );

  return engineer.maxCapacity - totalAllocated;
}

export function findSuitableEngineers(
  project: Project,
  engineers: Engineer[],
  assignments: Assignment[]
): {
  engineer: Engineer;
  availableCapacity: number;
  matchingSkills: string[];
}[] {
  return engineers
    .map(engineer => {
      const matchingSkills = project.requiredSkills.filter(skill =>
        engineer.skills.includes(skill)
      );
      
      return {
        engineer,
        availableCapacity: getAvailableCapacity(engineer, assignments),
        matchingSkills
      };
    })
    .filter(result => result.matchingSkills.length > 0 && result.availableCapacity > 0)
    .sort((a, b) => {
      // Sort by number of matching skills (descending)
      if (b.matchingSkills.length !== a.matchingSkills.length) {
        return b.matchingSkills.length - a.matchingSkills.length;
      }
      // Then by available capacity (descending)
      return b.availableCapacity - a.availableCapacity;
    });
} 