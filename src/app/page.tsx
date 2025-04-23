"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { assignCharacters } from "@/utils/characters";
import {
  createTeams,
  generateLadder,
  calculateLadderResults,
  Participant,
  LadderResult,
  ParticipantResult,
} from "@/utils/ladder";
import ParticipantList from "@/components/ParticipantList";
import GameSettings from "@/components/GameSettings";
import LadderVisualizer from "@/components/LadderVisualizer";
import ResultDisplay from "@/components/ResultDisplay";
import useLadderAnimation from "@/hooks/useLadderAnimation";

function LadderGame() {
  const searchParams = useSearchParams();
  const [participantsWithCharacters, setParticipantsWithCharacters] = useState<
    Participant[]
  >([]);
  const [membersPerTeam, setMembersPerTeam] = useState<number>(0);
  const [showLadder, setShowLadder] = useState<boolean>(true);
  const [moveAllAtOnce, setMoveAllAtOnce] = useState<boolean>(true);
  const [ladder, setLadder] = useState<boolean[][]>([]);
  const [teamSizes, setTeamSizes] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(-1);
  const [results, setResults] = useState<LadderResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ladderRef = useRef<HTMLDivElement>(null);
  const [ladderDimensions, setLadderDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showLimitWarning, setShowLimitWarning] = useState<boolean>(false);

  // 애니메이션 관련 훅 사용
  const {
    playerPositions,
    setPlayerPositions,
    pathSegments,
    setPathSegments,
    previouslyAnimatedPlayers,
    setPreviouslyAnimatedPlayers,
    animatePlayer,
    animateAllPlayers,
  } = useLadderAnimation({
    participantsWithCharacters,
    moveAllAtOnce,
    isPlaying,
    setIsPlaying,
    setAnimationComplete,
    setCurrentPlayerIndex,
  });

  // URL에서 참가자 데이터 가져오기
  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      const names = data.split(",").filter((name) => name.trim() !== "");
      if (names.length > 0) {
        const limitedNames = names.slice(0, 100);
        setParticipantsWithCharacters(assignCharacters(limitedNames));
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

    updateDimensions();

    if (isPlaying) {
      const timer = setTimeout(updateDimensions, 100);
      return () => clearTimeout(timer);
    }

    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [isPlaying]);

  // 팀 크기 변경 시 팀 개수 계산
  useEffect(() => {
    if (participantsWithCharacters.length > 0 && membersPerTeam > 0) {
      setTeamSizes(
        createTeams(participantsWithCharacters.length, membersPerTeam)
      );
    } else {
      setTeamSizes([]);
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
    if (membersPerTeam <= 0) {
      alert("팀당 인원수를 먼저 선택해주세요.");
      return;
    }

    if (containerRef.current) {
      setLadderDimensions({
        width: containerRef.current.offsetWidth,
        height: Math.min(600, window.innerHeight * 0.6),
      });
    }

    const grid = generateLadder(participantsWithCharacters.length, teamSizes);
    setLadder(grid);

    const initialPositions = Array(participantsWithCharacters.length)
      .fill(null)
      .map((_, i) => ({ x: i, y: 0 }));
    setPlayerPositions(initialPositions);

    setIsPlaying(true);
    setAnimationComplete(false);
    setCurrentPlayerIndex(moveAllAtOnce ? -1 : 0);
    setPathSegments([]);

    const calculatedResults = calculateLadderResults(
      grid,
      participantsWithCharacters,
      teamSizes
    );
    setResults(calculatedResults);

    setPreviouslyAnimatedPlayers([]);

    setTimeout(() => {
      if (moveAllAtOnce) {
        animateAllPlayers(calculatedResults.participantResults);
      } else {
        animatePlayer(0, calculatedResults.participantResults);
      }
    }, 300);
  };

  // 게임 재시작
  const resetGame = () => {
    setLadder([]);
    setIsPlaying(false);
    setAnimationComplete(false);
    setCurrentPlayerIndex(-1);
    setPlayerPositions([]);
    setResults(null);
    setPathSegments([]);
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
      const newParticipants = [...participantsWithCharacters];
      newParticipants.push(assignCharacters([name.trim()])[0]);
      setParticipantsWithCharacters(newParticipants);
    }
  };

  // URL 쿼리 파라미터로 변환
  const updateQueryString = () => {
    const names = participantsWithCharacters.map((p) => p.name).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("data", names);
    window.history.pushState({}, "", url.toString());

    if (animationComplete && results) {
      resetGame();
      setTimeout(() => {
        initializeLadder();
      }, 100);
    }
  };

  // 참가자 변경 감지 및 결과 동기화
  useEffect(() => {
    if (results && !isPlaying && animationComplete) {
      const resultParticipants = results.participantResults
        .map((r) => `${r.participant.name}-${r.participant.character}`)
        .join(",");

      const currentParticipants = participantsWithCharacters
        .map((p) => `${p.name}-${p.character}`)
        .join(",");

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
  }, [participantsWithCharacters]);

  // 팀당 인원수 선택 여부 확인
  const isTeamSizeSelected = membersPerTeam > 0;

  // 팀 배정 결과 가공
  const teamAssignments = results
    ? results.participantResults.map((result) => ({
        position: result.participant.name,
        team: result.team,
      }))
    : [];

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
          <ParticipantList
            participants={participantsWithCharacters}
            isPlaying={isPlaying}
            showLimitWarning={showLimitWarning}
            onAddParticipant={handleAddParticipant}
            onUpdateQueryString={updateQueryString}
          />

          {participantsWithCharacters.length > 0 &&
            !isPlaying &&
            !animationComplete && (
              <GameSettings
                membersPerTeam={membersPerTeam}
                showLadder={showLadder}
                moveAllAtOnce={moveAllAtOnce}
                teamSizes={teamSizes}
                isTeamSizeSelected={isTeamSizeSelected}
                onMembersPerTeamChange={setMembersPerTeam}
                onShowLadderChange={setShowLadder}
                onMoveAllAtOnceChange={setMoveAllAtOnce}
                onStartGame={initializeLadder}
                participantsCount={participantsWithCharacters.length}
              />
            )}

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

              <LadderVisualizer
                ladder={ladder}
                participants={participantsWithCharacters}
                showLadder={showLadder}
                ladderDimensions={ladderDimensions}
                playerPositions={playerPositions}
                currentPlayerIndex={currentPlayerIndex}
                pathSegments={pathSegments}
                previouslyAnimatedPlayers={previouslyAnimatedPlayers}
                isPlaying={isPlaying}
                animationComplete={animationComplete}
                moveAllAtOnce={moveAllAtOnce}
                teamAssignments={teamAssignments}
                containerRef={containerRef}
              />

              {animationComplete && results && (
                <ResultDisplay
                  results={results}
                  copied={copied}
                  onCopyResults={copyResults}
                  onResetGame={resetGame}
                />
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

export default function Home() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <LadderGame />
    </Suspense>
  );
}
