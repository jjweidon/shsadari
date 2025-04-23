"use client";

import { useState, useEffect, Fragment, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";

// 귀여운 캐릭터 이모지 배열
const CUTE_CHARACTERS = [
  // 동물
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐻‍❄️",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🐔",
  "🐧",
  "🐦",
  "🐤",
  "🦄",
  // 바다 생물
  "🦋",
  "🐢",
  "🐙",
  "🦀",
  "🦞",
  "🦐",
  "🦑",
  "🐠",
  "🐬",
  "🐋",
  "🦈",
  "🦭",
  // 곤충
  "🐝",
  "🪱",
  "🐛",
  "🦗",
  "🦟",
  "🪰",
  "🪲",
  "🐞",
  "🦂",
  "🕷️",
  // 기타 동물
  "🦔",
  "🦇",
  "🐅",
  "🐆",
  "🦓",
  "🦍",
  "🦧",
  "🐘",
  "🦛",
  "🦏",
  "🐪",
  "🐫",
  "🦒",
  "🦘",
  "🦬",
  "🐃",
  "🦙",
  "🦣",
  // 표정과 얼굴
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "🤣",
  "😂",
  "🙂",
  "🙃",
  "😉",
  "😊",
  "😇",
  "🥰",
  "😍",
  "🤩",
  "😘",
  "😗",
  // 음식
  "🍎",
  "🍐",
  "🍊",
  "🍋",
  "🍌",
  "🍉",
  "🍇",
  "🍓",
  "🫐",
  "🍈",
  "🍒",
  "🍑",
  "🥭",
  // 기타 이모지
  "🌟",
  "⭐",
  "🌈",
  "🌞",
  "🌝",
  "🌚",
  "🔥",
  "💫",
  "✨",
  "💥",
  "🎵",
  "🎶",
  "🎸",
  "🥁",
  "🏆",
];

// 랜덤 파스텔 색상 생성 함수
const generatePastelColor = () => {
  // 더 넓은 색상 범위 사용 (80-240)
  const r = Math.floor(Math.random() * 120 + 130)
    .toString(16)
    .padStart(2, "0");
  const g = Math.floor(Math.random() * 120 + 130)
    .toString(16)
    .padStart(2, "0");
  const b = Math.floor(Math.random() * 120 + 130)
    .toString(16)
    .padStart(2, "0");
  return `#${r}${g}${b}`;
};

// 각 참가자에게 캐릭터 할당
const assignCharacters = (participants: string[]) => {
  const shuffledCharacters = [...CUTE_CHARACTERS].sort(
    () => Math.random() - 0.5
  );
  return participants.map((name, index) => ({
    name,
    character: shuffledCharacters[index % shuffledCharacters.length],
    color: generatePastelColor(),
  }));
};

// 팀 생성 함수 (공평 분배 알고리즘 포함)
const createTeams = (totalParticipants: number, membersPerTeam: number) => {
  // 참가자 수가 100명 초과면 100명으로 제한
  const limitedParticipants = Math.min(totalParticipants, 100);

  const numTeams = Math.ceil(limitedParticipants / membersPerTeam);

  // 남은 인원 계산
  const remainder = limitedParticipants % membersPerTeam;

  // 기본 팀 크기 배열 생성 (모두 membersPerTeam으로 초기화)
  const teamSizes = Array(numTeams).fill(membersPerTeam);

  // 나머지가 있고 나머지가 팀 수보다 작으면 공평하게 분배
  if (remainder > 0 && remainder < numTeams) {
    // 남은 인원 처리 (균등하게 인원수를 분배, 적은 수의 팀에는 한 명씩 줄임)
    for (
      let i = numTeams - 1;
      i >= numTeams - (membersPerTeam * numTeams - limitedParticipants);
      i--
    ) {
      teamSizes[i] -= 1;
    }
  }

  return teamSizes;
};

// 사다리 생성 함수
const generateLadder = (participants: number, teamSizes: number[]) => {
  // 참가자 수가 많을 경우 가로선 확률 조정 (참가자가 많을수록 적은 가로선)
  const horizontalProbability = Math.max(0.2, 0.5 - participants * 0.003);

  // 세로선 개수 = 참가자 수
  const verticalLines = participants;

  // 가로선 최대 개수 (행 수) - 참가자가 많을 경우 행 수 제한
  const maxHorizontalLines = Math.min(participants * 2, 100);

  // 사다리 그리드 초기화 (false = 가로선 없음)
  const grid: boolean[][] = Array(maxHorizontalLines)
    .fill(null)
    .map(() => Array(verticalLines - 1).fill(false));

  // 랜덤하게 가로선 생성
  for (let y = 0; y < maxHorizontalLines; y++) {
    for (let x = 0; x < verticalLines - 1; x++) {
      // 이전 위치에 가로선이 있으면 현재 위치에는 가로선을 두지 않음
      if (x > 0 && grid[y][x - 1]) continue;

      grid[y][x] = Math.random() < horizontalProbability;
    }
  }

  return grid;
};

// 사다리 타기 결과 계산 함수
const calculateLadderResults = (
  grid: boolean[][],
  participantsWithCharacters: {
    name: string;
    character: string;
    color: string;
  }[],
  teamSizes: number[]
) => {
  const verticalLines = participantsWithCharacters.length;
  const results: {
    start: number;
    end: number;
    path: { x: number; y: number }[];
  }[] = [];

  // 각 시작 위치에서 끝까지 진행
  for (let start = 0; start < verticalLines; start++) {
    let current = start;
    const path: { x: number; y: number }[] = [{ x: current, y: 0 }];

    // 사다리 타기 진행
    for (let y = 0; y < grid.length; y++) {
      // 왼쪽에 가로선이 있는 경우
      if (current > 0 && grid[y][current - 1]) {
        current -= 1;
      }
      // 오른쪽에 가로선이 있는 경우
      else if (current < verticalLines - 1 && grid[y][current]) {
        current += 1;
      }
      path.push({ x: current, y: y + 1 });
    }

    results.push({ start, end: current, path });
  }

  // 참가자별 결과 매핑
  const participantResults = results.map((result) => ({
    participant: participantsWithCharacters[result.start],
    endPosition: result.end,
    path: result.path,
  }));

  // 팀 구분 경계 계산
  const teamBoundaries: number[] = [];
  let currentBoundary = 0;

  teamSizes.forEach((size) => {
    currentBoundary += size;
    teamBoundaries.push(currentBoundary);
  });

  // 각 참가자의 팀 할당
  const participantResultsWithTeam = participantResults.map((result) => {
    // 도착 위치에 따른 팀 인덱스 찾기
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

  // 팀별 결과 구성
  const teamResults: Record<
    string,
    {
      teamName: string;
      members: { name: string; character: string; color: string }[];
    }
  > = {};

  // 먼저 팀 객체 초기화
  teamSizes.forEach((_, index) => {
    const teamName = `${index + 1}팀`;
    teamResults[teamName] = { teamName, members: [] };
  });

  // 도착 위치(endPosition)를 기준으로 정렬하여 순서대로 팀에 할당
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

export default function Home() {
  // URL 쿼리 파라미터 가져오기
  const searchParams = useSearchParams();

  // 참가자 목록 상태
  const [participantsWithCharacters, setParticipantsWithCharacters] = useState<
    { name: string; character: string; color: string }[]
  >([]);

  // 팀 크기 선택 상태
  const [membersPerTeam, setMembersPerTeam] = useState<number>(3);

  // 게임 옵션 상태
  const [showLadder, setShowLadder] = useState<boolean>(true);
  const [moveAllAtOnce, setMoveAllAtOnce] = useState<boolean>(true);

  // 사다리 데이터 상태
  const [ladder, setLadder] = useState<boolean[][]>([]);
  const [teamSizes, setTeamSizes] = useState<number[]>([]);

  // 애니메이션 상태
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(-1);
  const [playerPositions, setPlayerPositions] = useState<
    { x: number; y: number }[]
  >([]);

  // 결과 상태
  const [results, setResults] = useState<{
    participantResults: {
      participant: { name: string; character: string; color: string };
      team: string;
      path: { x: number; y: number }[];
    }[];
    teamResults: Record<
      string,
      {
        teamName: string;
        members: { name: string; character: string; color: string }[];
      }
    >;
  } | null>(null);

  // 복사 상태
  const [copied, setCopied] = useState<boolean>(false);

  // 화면 크기에 따른 사다리 크기 조정
  const containerRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);
  const [ladderDimensions, setLadderDimensions] = useState({
    width: 0,
    height: 0,
  });

  // 참가자 수에 따른 제한 경고
  const [showLimitWarning, setShowLimitWarning] = useState<boolean>(false);

  // 경로 렌더링을 위한 상태
  const [pathSegments, setPathSegments] = useState<
    {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: string;
      playerIndex: number;
    }[]
  >([]);

  // 이전에 애니메이션된 플레이어를 추적하기 위한 상태
  const [previouslyAnimatedPlayers, setPreviouslyAnimatedPlayers] = useState<
    number[]
  >([]);

  // URL에서 참가자 데이터 가져오기
  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      const names = data.split(",").filter((name) => name.trim() !== "");
      if (names.length > 0) {
        // 100명으로 제한
        const limitedNames = names.slice(0, 100);
        setParticipantsWithCharacters(assignCharacters(limitedNames));

        // 제한 경고 표시
        if (names.length > 100) {
          setShowLimitWarning(true);
        }
      }
    }
  }, [searchParams]);

  // 화면 크기에 따른 사다리 크기 조정
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setLadderDimensions({
          width: containerRef.current.offsetWidth,
          height: Math.min(600, window.innerHeight * 0.6),
        });
      }
    };

    // 상태가 변경될 때마다 크기 업데이트
    updateDimensions();

    // 특히 isPlaying이 변경되면 짧은 지연 후 다시 크기 계산
    if (isPlaying) {
      const timer = setTimeout(updateDimensions, 100);
      return () => clearTimeout(timer);
    }

    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isPlaying]);

  // 팀 크기 변경 시 팀 개수 계산
  useEffect(() => {
    if (participantsWithCharacters.length > 0) {
      setTeamSizes(
        createTeams(participantsWithCharacters.length, membersPerTeam)
      );
    }
  }, [participantsWithCharacters.length, membersPerTeam]);

  // 사다리 생성 후 사다리 영역으로 스크롤
  useEffect(() => {
    if (isPlaying && ladderRef.current) {
      ladderRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isPlaying]);

  // 사다리 생성
  const initializeLadder = () => {
    // 현재 컨테이너 크기 강제 업데이트
    if (containerRef.current) {
      setLadderDimensions({
        width: containerRef.current.offsetWidth,
        height: Math.min(600, window.innerHeight * 0.6),
      });
    }

    const grid = generateLadder(participantsWithCharacters.length, teamSizes);
    setLadder(grid);

    // 초기 위치 설정 - 모든 참가자에 대해 유효한 초기 위치 설정
    const initialPositions = Array(participantsWithCharacters.length)
      .fill(null)
      .map((_, i) => ({ x: i, y: 0 }));
    setPlayerPositions(initialPositions);

    setIsPlaying(true);
    setAnimationComplete(false);
    setCurrentPlayerIndex(moveAllAtOnce ? -1 : 0);
    setPathSegments([]); // 경로 초기화

    // 결과 계산
    const calculatedResults = calculateLadderResults(
      grid,
      participantsWithCharacters,
      teamSizes
    );
    setResults(calculatedResults);

    // 이전에 이동한 플레이어 초기화
    setPreviouslyAnimatedPlayers([]);

    // 약간의 지연 후 애니메이션 시작 (사다리가 렌더링될 시간 확보)
    setTimeout(() => {
      if (moveAllAtOnce) {
        animateAllPlayers(calculatedResults.participantResults);
      } else {
        animatePlayer(0, calculatedResults.participantResults);
      }
    }, 300);
  };

  // 단일 플레이어 애니메이션
  const animatePlayer = (
    playerIndex: number,
    results: {
      participant: { name: string; character: string; color: string };
      team: string;
      path: { x: number; y: number }[];
    }[]
  ) => {
    if (playerIndex >= participantsWithCharacters.length) {
      setIsPlaying(false);
      setAnimationComplete(true);
      return;
    }

    // 현재 플레이어 인덱스 설정 - 참가자 순서대로 이동
    setCurrentPlayerIndex(playerIndex);

    // 참가자 이름 기준으로 결과 찾기
    const currentParticipant = participantsWithCharacters[playerIndex];
    // 현재 참가자에 해당하는 결과 찾기
    const resultIndex = results.findIndex(
      (r) =>
        r.participant.name === currentParticipant.name &&
        r.participant.character === currentParticipant.character
    );

    if (resultIndex === -1) {
      console.error("결과를 찾을 수 없습니다:", currentParticipant.name);
      // 다음 플레이어로 넘어감
      setTimeout(() => animatePlayer(playerIndex + 1, results), 100);
      return;
    }

    // 현재 플레이어 경로 정보
    const result = results[resultIndex];
    const path = result.path;
    const playerColor = result.participant.color;

    // 경로 애니메이션
    let step = 0;
    const interval = setInterval(() => {
      if (step < path.length - 1) {
        // path.length - 1까지만 진행 (다음 위치로 이동)
        // 현재 플레이어의 위치만 업데이트
        setPlayerPositions((prev) => {
          const newPositions = [...prev];
          // 현재 플레이어의 위치 업데이트
          newPositions[playerIndex] = path[step];
          return newPositions;
        });

        // 경로 세그먼트 추가
        const currentPos = path[step];
        const nextPos = path[step + 1];

        // nextPos가 유효한 경우에만 세그먼트 추가
        if (
          nextPos &&
          currentPos &&
          nextPos.x !== undefined &&
          nextPos.y !== undefined &&
          currentPos.x !== undefined &&
          currentPos.y !== undefined
        ) {
          // currentPos와 nextPos 사이의 경로 세그먼트 추가
          const newSegment = {
            x1: currentPos.x,
            y1: currentPos.y,
            x2: nextPos.x,
            y2: nextPos.y,
            color: playerColor,
            playerIndex,
          };

          setPathSegments((prev) => [...prev, newSegment]);
        }

        step++;
      } else if (step === path.length - 1) {
        // 마지막 위치 설정
        setPlayerPositions((prev) => {
          const newPositions = [...prev];
          newPositions[playerIndex] = path[step];
          return newPositions;
        });

        // 이 플레이어를 애니메이션된 플레이어 배열에 추가
        setPreviouslyAnimatedPlayers((prev) => {
          if (!prev.includes(playerIndex)) {
            return [...prev, playerIndex];
          }
          return prev;
        });

        step++;
      } else {
        clearInterval(interval);
        // 다음 플레이어로
        setTimeout(() => animatePlayer(playerIndex + 1, results), 250); // 다음 플레이어로 넘어가는 시간 단축
      }
    }, 175); // 애니메이션 속도 2배 빠르게 (350ms → 175ms)
  };

  // 모든 플레이어 함께 애니메이션
  const animateAllPlayers = (
    results: {
      participant: { name: string; character: string; color: string };
      team: string;
      path: { x: number; y: number }[];
    }[]
  ) => {
    // 가장 긴 경로 길이 찾기
    const maxPathLength = Math.max(...results.map((r) => r.path.length));

    // 시작하기 전에 경로 세그먼트 초기화
    setPathSegments([]);

    let step = 0;
    const interval = setInterval(() => {
      if (step < maxPathLength - 1) {
        // maxPathLength - 1까지만 진행 (다음 위치로 이동)
        // 현재 단계에서 각 플레이어의 위치 업데이트
        setPlayerPositions((prev) => {
          // 모든 플레이어에 대해 새 위치를 계산하되, 유효하지 않은 경우 이전 위치 유지
          return results.map((result, i) => {
            if (step < result.path.length && result.path[step]) {
              return result.path[step];
            }
            // 이미 도착한 플레이어나 유효하지 않은 경우 이전 위치 유지
            return prev[i] || { x: i, y: 0 }; // 이전 위치가 없으면 기본값 제공
          });
        });

        // 경로 세그먼트 추가
        const newSegments: {
          x1: number;
          y1: number;
          x2: number;
          y2: number;
          color: string;
          playerIndex: number;
        }[] = [];

        results.forEach((result, playerIndex) => {
          if (step < result.path.length - 1) {
            const currentPos = result.path[step];
            const nextPos = result.path[step + 1];

            // nextPos와 currentPos가 모두 유효한 경우에만 세그먼트 추가
            if (
              nextPos &&
              currentPos &&
              nextPos.x !== undefined &&
              nextPos.y !== undefined &&
              currentPos.x !== undefined &&
              currentPos.y !== undefined
            ) {
              newSegments.push({
                x1: currentPos.x,
                y1: currentPos.y,
                x2: nextPos.x,
                y2: nextPos.y,
                color: result.participant.color,
                playerIndex,
              });
            }
          }
        });

        // 한 번에 세그먼트 추가하여 불필요한 리렌더링 방지
        setPathSegments((prev) => [...prev, ...newSegments]);

        step++;
      } else if (step === maxPathLength - 1) {
        // 마지막 위치 설정
        setPlayerPositions((prev) => {
          return results.map((result, i) => {
            if (step < result.path.length && result.path[step]) {
              return result.path[step];
            }
            return prev[i] || { x: i, y: 0 }; // 이전 위치가 없으면 기본값 제공
          });
        });

        step++;
      } else {
        clearInterval(interval);
        setIsPlaying(false);
        setAnimationComplete(true);
      }
    }, 350);
  };

  // 게임 재시작
  const resetGame = () => {
    setLadder([]);
    setIsPlaying(false);
    setAnimationComplete(false);
    setCurrentPlayerIndex(-1);
    setPlayerPositions([]);
    setResults(null);
    setPathSegments([]); // 경로 초기화
  };

  // 결과 복사
  const copyResults = () => {
    if (!results) return;

    const text = Object.values(results.teamResults)
      .map(
        (team) =>
          `${team.teamName}: ${team.members
            .map((m) => `${m.character} ${m.name}`)
            .join(", ")}`
      )
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 수동으로 참가자 추가
  const handleAddParticipant = () => {
    const name = prompt("추가할 참가자 이름을 입력하세요:");
    if (name && name.trim() !== "") {
      const newParticipant = {
        name: name.trim(),
        character:
          CUTE_CHARACTERS[Math.floor(Math.random() * CUTE_CHARACTERS.length)],
        color: generatePastelColor(),
      };
      setParticipantsWithCharacters((prev) => [...prev, newParticipant]);
    }
  };

  // URL 쿼리 파라미터로 변환
  const updateQueryString = () => {
    const names = participantsWithCharacters.map((p) => p.name).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("data", names);
    window.history.pushState({}, "", url.toString());

    // URL 업데이트 후 사다리 결과가 이미 표시 중이면 재시작
    if (animationComplete && results) {
      resetGame();
      setTimeout(() => {
        initializeLadder();
      }, 100);
    }
  };

  // 참가자 변경 감지 및 결과 동기화
  useEffect(() => {
    // 결과가 표시 중일 때 참가자 데이터가 변경되면 결과 초기화
    if (results && !isPlaying && animationComplete) {
      // 결과에 저장된 참가자와 현재 참가자가 일치하는지 확인
      const resultParticipants = results.participantResults
        .map((r) => `${r.participant.name}-${r.participant.character}`)
        .join(",");

      const currentParticipants = participantsWithCharacters
        .map((p) => `${p.name}-${p.character}`)
        .join(",");

      // 일치하지 않으면 결과 초기화 또는 재계산
      if (resultParticipants !== currentParticipants) {
        if (
          window.confirm(
            "참가자 정보가 변경되었습니다. 사다리를 다시 시작하시겠습니까?"
          )
        ) {
          resetGame();
          setTimeout(() => {
            initializeLadder();
          }, 100);
        }
      }
    }
  }, [participantsWithCharacters]); // 참가자 목록이 변경될 때만 실행

  // 사다리 시각화를 위한 계산
  const calculateLadderVisuals = () => {
    if (!ladder.length || participantsWithCharacters.length === 0) return null;

    const ladderWidth = ladderDimensions.width;
    // 여백을 더 확보하기 위해 높이 조정
    const ladderHeight = ladderDimensions.height + 80;

    const verticalLines = participantsWithCharacters.length;
    const horizontalLines = ladder.length;

    // 참가자 수가 많을 경우 간격 조정
    const lineSpacing = ladderWidth / (verticalLines + 1);
    const rowHeight = (ladderHeight - 120) / (horizontalLines + 1); // 상하 여백 확보

    // 이름 태그와 세로선 사이의 여백
    const nameTagHeight = 35;
    const teamTagHeight = 35;
    const topPadding = nameTagHeight + 20; // 이름 태그 + 추가 여백
    const bottomPadding = teamTagHeight + 20; // 팀 태그 + 추가 여백

    // 경로 세그먼트 렌더링
    const pathElements = pathSegments.map((segment, i) => {
      const x1 = (segment.x1 + 1) * lineSpacing;
      const y1 = topPadding + segment.y1 * rowHeight;
      const x2 = (segment.x2 + 1) * lineSpacing;
      const y2 = topPadding + segment.y2 * rowHeight;

      return (
        <line
          key={`path-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={segment.color}
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.7}
        />
      );
    });

    // 세로선 생성 - 성능 최적화: 많은 참가자의 경우 간소화
    const verticalLinesElements = Array.from(
      { length: verticalLines },
      (_, i) => {
        const x = (i + 1) * lineSpacing;
        return (
          <line
            key={`v-${i}`}
            x1={x}
            y1={topPadding} // 참가자 이름 태그 아래에서 시작
            x2={x}
            y2={ladderHeight - bottomPadding} // 팀 이름 태그 위에서 끝
            stroke="#333"
            strokeWidth={verticalLines > 50 ? 1 : 2}
          />
        );
      }
    );

    // 가로선 생성 - 참가자가 많은 경우 성능 최적화
    const horizontalLinesElements = [];
    // 참가자가 많은 경우 렌더링할 가로선 수 제한
    const renderStep = verticalLines > 50 ? 2 : 1;

    for (let y = 0; y < horizontalLines; y++) {
      for (let x = 0; x < verticalLines - 1; x += renderStep) {
        if (ladder[y][x]) {
          const x1 = (x + 1) * lineSpacing;
          const x2 = (x + 2) * lineSpacing;
          const y1 = topPadding + (y + 1) * rowHeight;

          horizontalLinesElements.push(
            <line
              key={`h-${y}-${x}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y1}
              stroke="#333"
              strokeWidth={verticalLines > 50 ? 1 : 2}
              strokeDasharray={showLadder ? "0" : "5,5"}
              opacity={showLadder ? 1 : 0.3}
            />
          );
        }
      }
    }

    // 참가자 이름 요소들 - styled div 사용
    const nameElements =
      participantsWithCharacters.length <= 50
        ? participantsWithCharacters.map((participant, i) => {
            const x = (i + 1) * lineSpacing;
            const width = Math.min(lineSpacing * 0.8, 80); // 너비 제한

            return (
              <foreignObject
                key={`name-${i}`}
                x={x - width / 2}
                y={5}
                width={width}
                height={nameTagHeight}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: participant.color,
                    color: "#333", // 어두운 텍스트 색상
                    fontSize:
                      participantsWithCharacters.length > 30 ? "8px" : "12px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    padding: "2px 4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  {participant.name.length > 8
                    ? participant.name.substring(0, 8) + "..."
                    : participant.name}
                </div>
              </foreignObject>
            );
          })
        : [];

    // 플레이어 캐릭터 위치 계산
    const playerElements = participantsWithCharacters.map((participant, i) => {
      if (playerPositions.length <= i || !playerPositions[i]) return null;

      const position = playerPositions[i];
      // position이 유효한지 확인
      if (!position || position.x === undefined || position.y === undefined)
        return null;

      const x = (position.x + 1) * lineSpacing;
      const y = topPadding + position.y * rowHeight;

      // 현재 플레이어 또는 이전에 이동 완료된 플레이어 표시
      const isActive =
        moveAllAtOnce ||
        i === currentPlayerIndex ||
        previouslyAnimatedPlayers.includes(i);

      // 비활성 상태일 때는 렌더링하지 않음
      if (!isActive) return null;

      return (
        <g
          key={`player-${i}`}
          transform={`translate(${x}, ${y})`}
          className="transition-all duration-300 opacity-100"
        >
          <circle
            r={participantsWithCharacters.length > 50 ? 10 : 15}
            fill={participant.color}
            opacity="0.8"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={participantsWithCharacters.length > 50 ? "14" : "20"}
            className="select-none"
          >
            {participant.character}
          </text>
        </g>
      );
    });

    // 결과 계산 및 팀 배정 결과
    const teamAssignments = results
      ? results.participantResults.map((result) => ({
          position: result.participant.name,
          team: result.team,
        }))
      : [];

    // 정렬된 팀 배정 - x 좌표 순서대로
    const sortedTeamAssignments = [...teamAssignments].sort((a, b) => {
      const aIndex = participantsWithCharacters.findIndex(
        (p) => p.name === a.position
      );
      const bIndex = participantsWithCharacters.findIndex(
        (p) => p.name === b.position
      );
      return aIndex - bIndex;
    });

    // 각 사다리 끝에 팀 이름 표시
    const teamElements = participantsWithCharacters.map((participant, i) => {
      const x = (i + 1) * lineSpacing;
      const width = Math.min(lineSpacing * 0.8, 80); // 너비 제한

      // 해당 위치의 팀 찾기
      const team =
        sortedTeamAssignments[i]?.team || `팀 ${Math.floor(i / 3) + 1}`;

      return (
        <foreignObject
          key={`team-${i}`}
          x={x - width / 2}
          y={ladderHeight - teamTagHeight - 5}
          width={width}
          height={teamTagHeight}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#eff6ff",
              color: "#1d4ed8",
              fontSize: participantsWithCharacters.length > 30 ? "8px" : "12px",
              fontWeight: 700,
              borderRadius: "6px",
              border: "1px solid #3b82f6",
              padding: "2px 4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            {team}
          </div>
        </foreignObject>
      );
    });

    return (
      <svg width={ladderWidth} height={ladderHeight}>
        {verticalLinesElements}
        {showLadder && horizontalLinesElements}
        {pathElements}
        {nameElements}
        {teamElements}
        {playerElements}
      </svg>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-2">
          <img src="/favicon.ico" alt="신한 로고" className="w-8 h-8" />
          <h1 className="text-3xl font-bold text-blue-600 mb-2">
            신한DS 금융SW 아카데미 사다리 게임
          </h1>
          <img src="/favicon.ico" alt="신한 로고" className="w-8 h-8" />
        </div>
        <p className="text-gray-600">5기 1회차 팀 구성을 위한 사다리타기</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* 참가자 목록 및 게임 설정 (항상 보임) */}
          <div className={`mb-6 ${isPlaying ? "opacity-70" : ""}`}>
            <div className="flex flex-wrap items-center mb-4 gap-2">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-blue-600">
                  참가자 목록
                </h2>
                <p className="text-sm text-gray-500">
                  URL에 data=이름1,이름2,... 형식으로 참가자를 추가할 수
                  있습니다.
                </p>
              </div>
              <button
                onClick={handleAddParticipant}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
                disabled={isPlaying}
              >
                참가자 추가
              </button>
              <button
                onClick={updateQueryString}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                disabled={isPlaying}
              >
                URL 업데이트
              </button>
            </div>

            {showLimitWarning && (
              <div className="p-3 bg-yellow-100 text-yellow-800 rounded mb-4">
                ⚠️ 참가자가 100명을 초과하여 100명으로 제한되었습니다.
              </div>
            )}

            {participantsWithCharacters.length > 0 ? (
              <>
                <p className="mb-2 text-gray-700">
                  총 참가자: {participantsWithCharacters.length}명
                </p>
                <div
                  className={`grid ${
                    participantsWithCharacters.length > 50
                      ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6"
                      : participantsWithCharacters.length > 20
                      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                  } gap-2 mb-6 overflow-y-auto max-h-80`}
                >
                  {participantsWithCharacters.map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 border rounded text-sm"
                      style={{ backgroundColor: participant.color }}
                    >
                      <span className="mr-1 text-lg">
                        {participant.character}
                      </span>
                      <span className="font-semibold text-gray-700 truncate">
                        {participant.name}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-4 bg-yellow-50 text-yellow-700 rounded mb-4">
                참가자가 없습니다. URL 쿼리 파라미터(data=)를 사용하여 참가자를
                추가하세요.
              </div>
            )}
          </div>

          {participantsWithCharacters.length > 0 &&
            !isPlaying &&
            !animationComplete && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3 text-blue-600">
                    게임 설정
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">
                        팀당 인원 수
                      </label>
                      <select
                        value={membersPerTeam}
                        onChange={(e) =>
                          setMembersPerTeam(Number(e.target.value))
                        }
                        className="w-full p-2 border rounded text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-300"
                      >
                        <option value={1}>1명</option>
                        <option value={2}>2명</option>
                        <option value={3}>3명</option>
                        <option value={4}>4명</option>
                        <option value={5}>5명</option>
                        <option value={6}>6명</option>
                        <option value={7}>7명</option>
                        <option value={8}>8명</option>
                        <option value={9}>9명</option>
                        <option value={10}>10명</option>
                      </select>
                      {teamSizes.length > 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                          총 {teamSizes.length}개 팀:{" "}
                          {Array.from(new Set(teamSizes))
                            .sort((a, b) => b - a)
                            .map((size) => {
                              const count = teamSizes.filter(
                                (s) => s === size
                              ).length;
                              return `[${size}명 * ${count}]`;
                            })
                            .join("  ")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">
                        사다리 표시
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="showLadder"
                          checked={showLadder}
                          onChange={(e) => setShowLadder(e.target.checked)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-300"
                        />
                        <label htmlFor="showLadder" className="text-gray-500">
                          사다리 선 보이기
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">
                        이동 방식
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="moveAllAtOnce"
                          checked={moveAllAtOnce}
                          onChange={(e) => setMoveAllAtOnce(e.target.checked)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-300"
                        />
                        <label
                          htmlFor="moveAllAtOnce"
                          className="text-gray-500"
                        >
                          모두 함께 이동
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={initializeLadder}
                    className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={participantsWithCharacters.length === 0}
                  >
                    사다리 타기 시작!
                  </button>
                </div>
              </>
            )}

          {/* 사다리 타기 영역 (isPlaying이나 animationComplete일 때만 보임) */}
          {(isPlaying || animationComplete) && (
            <div ref={ladderRef}>
              <hr className="my-8 border-gray-200" />

              <h2 className="text-xl font-semibold mb-3 text-blue-600">
                {isPlaying && !animationComplete
                  ? "🪜 사다리 타는 중..."
                  : "✓ 사다리 결과"}
              </h2>

              {participantsWithCharacters.length > 50 && (
                <div className="p-3 bg-blue-100 text-blue-800 rounded mb-4">
                  💡 참가자가 많아 가독성을 위해 UI가 간소화되었습니다.
                </div>
              )}

              <div
                ref={containerRef}
                className="relative overflow-hidden mb-6 border rounded-lg bg-gray-50 p-4"
                style={{ minHeight: "300px" }}
              >
                {ladderDimensions.width > 0 ? (
                  calculateLadderVisuals()
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-500">사다리를 준비 중입니다...</p>
                  </div>
                )}
              </div>

              {animationComplete && results && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-600">결과</h2>
                    <button
                      onClick={copyResults}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-500 rounded hover:bg-gray-300 transition"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          <span>복사됨</span>
                        </>
                      ) : (
                        <>
                          <ClipboardIcon className="h-4 w-4" />
                          <span>결과 복사</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.values(results.teamResults).map((team, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <h3 className="font-bold text-lg text-gray-800 mb-2">
                          {team.teamName}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {team.members.map((member, i) => (
                            <div
                              key={i}
                              className="flex items-center px-3 py-1.5 rounded-full shadow-sm"
                              style={{ backgroundColor: member.color }}
                            >
                              <span className="mr-1">{member.character}</span>
                              <span className="font-semibold text-gray-800">
                                {member.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    <button
                      onClick={resetGame}
                      className="bg-blue-500 font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                      다시 하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center mt-12 text-gray-500 text-sm">
        ©{" "}
        <a
          href="https://github.com/jjweidon"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors"
        >
          jjweidon
        </a>
      </footer>
    </div>
  );
}
