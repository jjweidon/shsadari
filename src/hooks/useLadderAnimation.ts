import { useState, useEffect } from "react";
import { Participant, Path, ParticipantResult } from "../utils/ladder";

interface UseLadderAnimationProps {
  participantsWithCharacters: Participant[];
  moveAllAtOnce: boolean;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  setAnimationComplete: (value: boolean) => void;
  setCurrentPlayerIndex: (value: number) => void;
}

interface UseLadderAnimationReturn {
  playerPositions: Path[];
  setPlayerPositions: React.Dispatch<React.SetStateAction<Path[]>>;
  pathSegments: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    playerIndex: number;
  }[];
  setPathSegments: React.Dispatch<
    React.SetStateAction<
      {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        color: string;
        playerIndex: number;
      }[]
    >
  >;
  previouslyAnimatedPlayers: number[];
  setPreviouslyAnimatedPlayers: React.Dispatch<React.SetStateAction<number[]>>;
  animatePlayer: (playerIndex: number, results: ParticipantResult[]) => void;
  animateAllPlayers: (results: ParticipantResult[]) => void;
}

export default function useLadderAnimation({
  participantsWithCharacters,
  moveAllAtOnce,
  isPlaying,
  setIsPlaying,
  setAnimationComplete,
  setCurrentPlayerIndex,
}: UseLadderAnimationProps): UseLadderAnimationReturn {
  const [playerPositions, setPlayerPositions] = useState<Path[]>([]);
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
  const [previouslyAnimatedPlayers, setPreviouslyAnimatedPlayers] = useState<
    number[]
  >([]);

  // 단일 플레이어 애니메이션
  const animatePlayer = (playerIndex: number, results: ParticipantResult[]) => {
    if (playerIndex >= participantsWithCharacters.length) {
      setIsPlaying(false);
      setAnimationComplete(true);
      return;
    }

    setCurrentPlayerIndex(playerIndex);

    const currentParticipant = participantsWithCharacters[playerIndex];
    const resultIndex = results.findIndex(
      (r) =>
        r.participant.name === currentParticipant.name &&
        r.participant.character === currentParticipant.character
    );

    if (resultIndex === -1) {
      console.error("결과를 찾을 수 없습니다:", currentParticipant.name);
      setTimeout(() => animatePlayer(playerIndex + 1, results), 100);
      return;
    }

    const result = results[resultIndex];
    const path = result.path;
    const playerColor = result.participant.color;

    let step = 0;
    const interval = setInterval(() => {
      if (step < path.length - 1) {
        setPlayerPositions((prev) => {
          const newPositions = [...prev];
          newPositions[playerIndex] = path[step];
          return newPositions;
        });

        const currentPos = path[step];
        const nextPos = path[step + 1];

        if (
          nextPos &&
          currentPos &&
          nextPos.x !== undefined &&
          nextPos.y !== undefined &&
          currentPos.x !== undefined &&
          currentPos.y !== undefined
        ) {
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
        setPlayerPositions((prev) => {
          const newPositions = [...prev];
          newPositions[playerIndex] = path[step];
          return newPositions;
        });

        setPreviouslyAnimatedPlayers((prev) => {
          if (!prev.includes(playerIndex)) {
            return [...prev, playerIndex];
          }
          return prev;
        });

        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => animatePlayer(playerIndex + 1, results), 250);
      }
    }, 175);
  };

  // 모든 플레이어 함께 애니메이션
  const animateAllPlayers = (results: ParticipantResult[]) => {
    const maxPathLength = Math.max(...results.map((r) => r.path.length));
    setPathSegments([]);

    let step = 0;
    const interval = setInterval(() => {
      if (step < maxPathLength - 1) {
        setPlayerPositions((prev) => {
          return results.map((result, i) => {
            if (step < result.path.length && result.path[step]) {
              return result.path[step];
            }
            return prev[i] || { x: i, y: 0 };
          });
        });

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

        setPathSegments((prev) => [...prev, ...newSegments]);
        step++;
      } else if (step === maxPathLength - 1) {
        setPlayerPositions((prev) => {
          return results.map((result, i) => {
            if (step < result.path.length && result.path[step]) {
              return result.path[step];
            }
            return prev[i] || { x: i, y: 0 };
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

  return {
    playerPositions,
    setPlayerPositions,
    pathSegments,
    setPathSegments,
    previouslyAnimatedPlayers,
    setPreviouslyAnimatedPlayers,
    animatePlayer,
    animateAllPlayers,
  };
}
