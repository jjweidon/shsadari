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

export const createTeams = (totalParticipants: number, membersPerTeam: number) => {
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

export const generateLadder = (participants: number) => {
  const verticalLines = participants - 1;
  const horizontalLines = Math.min(participants + 10, 30);
  const grid: boolean[][] = Array(horizontalLines)
    .fill(null)
    .map(() => Array(verticalLines).fill(false));

  // 각 세로선(x)별 가로선 개수를 추적
  const horizontalLineCounts = Array(verticalLines).fill(0);

  // 각 높이(y)별 가로선 개수를 추적
  const heightLineCounts = Array(horizontalLines).fill(0);

  // 전체 가로선 개수 계산 (참가자 수에 비례)
  const totalHorizontalLines = Math.floor(participants * 5);

  // 가로선 생성
  for (let i = 0; i < totalHorizontalLines; i++) {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      // 랜덤한 x 위치 선택
      const x = Math.floor(Math.random() * verticalLines);
      // 랜덤한 y 위치 선택
      const y = Math.floor(Math.random() * horizontalLines);

      // 해당 위치에 가로선을 그릴 수 있는지 확인
      if (
        // 이미 가로선이 있는지 확인
        !grid[y][x] &&
        // 같은 높이에 인접한 가로선이 없는지 확인
        (x === 0 || !grid[y][x - 1]) &&
        (x === verticalLines - 1 || !grid[y][x + 1]) &&
        // 각 세로선의 가로선 개수가 너무 차이나지 않는지 확인
        horizontalLineCounts[x] < Math.ceil(totalHorizontalLines / verticalLines) * 1.5 &&
        // 각 높이의 가로선 개수가 너무 많은지 확인
        heightLineCounts[y] < Math.ceil(verticalLines / 2)
      ) {
        grid[y][x] = true;
        horizontalLineCounts[x]++;
        heightLineCounts[y]++;
        break;
      }
      attempts++;
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

  const teamBoundaries: number[] = [];
  let currentBoundary = 0;

  teamSizes.forEach((size) => {
    currentBoundary += size;
    teamBoundaries.push(currentBoundary);
  });

  const participantResults = results.map((result) => {
    let teamIndex = 0;
    for (let i = 0; i < teamBoundaries.length; i++) {
      if (result.end < teamBoundaries[i]) {
        teamIndex = i;
        break;
      }
    }

    return {
      participant: participantsWithCharacters[result.start],
      team: `${teamIndex + 1}팀`,
      path: result.path
    };
  });

  const teamResults: Record<string, TeamResult> = {};

  teamSizes.forEach((_, index) => {
    const teamName = `${index + 1}팀`;
    teamResults[teamName] = { teamName, members: [] };
  });

  participantResults
    .sort((a, b) => {
      const aEnd =
        results.find((r) => r.start === participantsWithCharacters.indexOf(a.participant))?.end ||
        0;
      const bEnd =
        results.find((r) => r.start === participantsWithCharacters.indexOf(b.participant))?.end ||
        0;
      return aEnd - bEnd;
    })
    .forEach((result) => {
      const { team, participant } = result;
      teamResults[team].members.push(participant);
    });

  return {
    participantResults,
    teamResults
  };
};
