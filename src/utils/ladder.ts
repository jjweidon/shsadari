export interface Participant {
  name: string;
  character: string;
  color: string;
}

export interface TeamResult {
  teamName: string;
  members: Participant[];
}

export interface Path {
  x: number;
  y: number;
}

export interface ParticipantResult {
  participant: Participant;
  team: string;
  path: Path[];
}

export interface LadderResult {
  participantResults: ParticipantResult[];
  teamResults: Record<string, TeamResult>;
}

export const createTeams = (
  totalParticipants: number,
  membersPerTeam: number
) => {
  const limitedParticipants = Math.min(totalParticipants, 100);
  const fullTeams = Math.floor(limitedParticipants / membersPerTeam);
  const remainder = limitedParticipants % membersPerTeam;

  if (fullTeams === 1 && remainder > 0) {
    return [membersPerTeam, remainder];
  }

  const teamSizes = Array(fullTeams).fill(membersPerTeam);

  if (remainder > 0) {
    if (remainder >= membersPerTeam / 2) {
      teamSizes.push(remainder);
    } else {
      for (let i = 0; i < remainder; i++) {
        teamSizes[i]++;
      }
    }
  }

  return teamSizes;
};

export const generateLadder = (participants: number, teamSizes: number[]) => {
  const horizontalProbability = Math.max(0.2, 0.5 - participants * 0.003);
  const verticalLines = participants;
  const maxHorizontalLines = Math.min(participants * 2, 100);
  const grid: boolean[][] = Array(maxHorizontalLines)
    .fill(null)
    .map(() => Array(verticalLines - 1).fill(false));

  for (let y = 0; y < maxHorizontalLines; y++) {
    for (let x = 0; x < verticalLines - 1; x++) {
      if (x > 0 && grid[y][x - 1]) continue;
      grid[y][x] = Math.random() < horizontalProbability;
    }
  }

  return grid;
};

export const calculateLadderResults = (
  grid: boolean[][],
  participantsWithCharacters: Participant[],
  teamSizes: number[]
): LadderResult => {
  const verticalLines = participantsWithCharacters.length;
  const results: {
    start: number;
    end: number;
    path: Path[];
  }[] = [];

  for (let start = 0; start < verticalLines; start++) {
    let current = start;
    const path: Path[] = [{ x: current, y: 0 }];

    for (let y = 0; y < grid.length; y++) {
      if (current > 0 && grid[y][current - 1]) {
        current -= 1;
      } else if (current < verticalLines - 1 && grid[y][current]) {
        current += 1;
      }
      path.push({ x: current, y: y + 1 });
    }

    results.push({ start, end: current, path });
  }

  const participantResults = results.map((result) => ({
    participant: participantsWithCharacters[result.start],
    endPosition: result.end,
    path: result.path,
  }));

  const teamBoundaries: number[] = [];
  let currentBoundary = 0;

  teamSizes.forEach((size) => {
    currentBoundary += size;
    teamBoundaries.push(currentBoundary);
  });

  const participantResultsWithTeam = participantResults.map((result) => {
    let teamIndex = 0;
    for (let i = 0; i < teamBoundaries.length; i++) {
      if (result.endPosition < teamBoundaries[i]) {
        teamIndex = i;
        break;
      }
    }

    return {
      participant: result.participant,
      team: `${teamIndex + 1}팀`,
      path: result.path,
    };
  });

  const teamResults: Record<string, TeamResult> = {};

  teamSizes.forEach((_, index) => {
    const teamName = `${index + 1}팀`;
    teamResults[teamName] = { teamName, members: [] };
  });

  participantResultsWithTeam
    .sort((a, b) => {
      const aPos =
        results.find(
          (r) => r.start === participantsWithCharacters.indexOf(a.participant)
        )?.end || 0;
      const bPos =
        results.find(
          (r) => r.start === participantsWithCharacters.indexOf(b.participant)
        )?.end || 0;
      return aPos - bPos;
    })
    .forEach((result) => {
      const { team, participant } = result;
      teamResults[team].members.push(participant);
    });

  return {
    participantResults: participantResultsWithTeam,
    teamResults,
  };
};
