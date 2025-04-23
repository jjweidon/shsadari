import React from "react";
import { Participant, Path } from "../utils/ladder";

interface LadderVisualizerProps {
  ladder: boolean[][];
  participants: Participant[];
  showLadder: boolean;
  ladderDimensions: { width: number; height: number };
  playerPositions: Path[];
  currentPlayerIndex: number;
  pathSegments: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    playerIndex: number;
  }[];
  previouslyAnimatedPlayers: number[];
  isPlaying: boolean;
  animationComplete: boolean;
  moveAllAtOnce: boolean;
  teamAssignments: { position: string; team: string }[];
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function LadderVisualizer({
  ladder,
  participants,
  showLadder,
  ladderDimensions,
  playerPositions,
  currentPlayerIndex,
  pathSegments,
  previouslyAnimatedPlayers,
  isPlaying,
  animationComplete,
  moveAllAtOnce,
  teamAssignments,
  containerRef,
}: LadderVisualizerProps) {
  if (!ladder.length || participants.length === 0) return null;

  const ladderWidth = ladderDimensions.width;
  const ladderHeight = ladderDimensions.height + 80;
  const verticalLines = participants.length;
  const horizontalLines = ladder.length;
  const lineSpacing = ladderWidth / (verticalLines + 1);
  const rowHeight = (ladderHeight - 120) / (horizontalLines + 1);
  const nameTagHeight = 35;
  const teamTagHeight = 35;
  const topPadding = nameTagHeight + 20;
  const bottomPadding = teamTagHeight + 20;

  // 정렬된 팀 배정 - x 좌표 순서대로
  const sortedTeamAssignments = [...teamAssignments].sort((a, b) => {
    const aIndex = participants.findIndex((p) => p.name === a.position);
    const bIndex = participants.findIndex((p) => p.name === b.position);
    return aIndex - bIndex;
  });

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

  // 세로선 생성
  const verticalLinesElements = Array.from(
    { length: verticalLines },
    (_, i) => {
      const x = (i + 1) * lineSpacing;
      return (
        <line
          key={`v-${i}`}
          x1={x}
          y1={topPadding}
          x2={x}
          y2={ladderHeight - bottomPadding}
          stroke="#333"
          strokeWidth={verticalLines > 50 ? 1 : 2}
        />
      );
    }
  );

  // 가로선 생성
  const horizontalLinesElements = [];
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

  // 참가자 이름 요소들
  const nameElements =
    participants.length <= 50
      ? participants.map((participant, i) => {
          const x = (i + 1) * lineSpacing;
          const width = Math.min(lineSpacing * 0.8, 80);

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
                  color: "#333",
                  fontSize: participants.length > 30 ? "8px" : "12px",
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
  const playerElements = participants.map((participant, i) => {
    if (playerPositions.length <= i || !playerPositions[i]) return null;

    const position = playerPositions[i];
    if (!position || position.x === undefined || position.y === undefined)
      return null;

    const x = (position.x + 1) * lineSpacing;
    const y = topPadding + position.y * rowHeight;

    const isActive =
      moveAllAtOnce ||
      i === currentPlayerIndex ||
      previouslyAnimatedPlayers.includes(i);

    if (!isActive) return null;

    return (
      <g
        key={`player-${i}`}
        transform={`translate(${x}, ${y})`}
        className="transition-all duration-300 opacity-100"
      >
        <circle
          r={participants.length > 50 ? 10 : 15}
          fill={participant.color}
          opacity="0.8"
        />
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={participants.length > 50 ? "14" : "20"}
          className="select-none"
        >
          {participant.character}
        </text>
      </g>
    );
  });

  // 각 사다리 끝에 팀 이름 표시
  const teamElements = participants.map((participant, i) => {
    const x = (i + 1) * lineSpacing;
    const width = Math.min(lineSpacing * 0.8, 80);
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
            fontSize: participants.length > 30 ? "8px" : "12px",
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
    <div
      ref={containerRef}
      className="relative overflow-hidden mb-6 border rounded-lg bg-gray-50 p-4"
      style={{ minHeight: "300px" }}
    >
      {ladderDimensions.width > 0 ? (
        <svg width={ladderWidth} height={ladderHeight}>
          {verticalLinesElements}
          {showLadder && horizontalLinesElements}
          {pathElements}
          {nameElements}
          {teamElements}
          {playerElements}
        </svg>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">사다리를 준비 중입니다...</p>
        </div>
      )}
    </div>
  );
}
