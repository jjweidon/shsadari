import React from "react";

interface GameSettingsProps {
  membersPerTeam: number;
  showLadder: boolean;
  moveAllAtOnce: boolean;
  ladderSpeed: string;
  teamSizes: number[];
  isTeamSizeSelected: boolean;
  onMembersPerTeamChange: (value: number) => void;
  onShowLadderChange: (value: boolean) => void;
  onMoveAllAtOnceChange: (value: boolean) => void;
  onLadderSpeedChange: (value: string) => void;
  onStartGame: () => void;
  participantsCount: number;
}

export default function GameSettings({
  membersPerTeam,
  showLadder,
  moveAllAtOnce,
  ladderSpeed,
  teamSizes,
  isTeamSizeSelected,
  onMembersPerTeamChange,
  onShowLadderChange,
  onMoveAllAtOnceChange,
  onLadderSpeedChange,
  onStartGame,
  participantsCount,
}: GameSettingsProps) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 text-blue-600">게임 설정</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              팀당 인원 수
            </label>
            <select
              value={membersPerTeam}
              onChange={(e) => onMembersPerTeamChange(Number(e.target.value))}
              className="w-full p-2 border rounded text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-300"
            >
              <option value={0}>선택하세요</option>
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
            {!isTeamSizeSelected && (
              <p className="mt-1 text-sm text-red-500">
                팀당 인원수를 선택해주세요
              </p>
            )}
            {teamSizes.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                총 {teamSizes.length}개 팀:{" "}
                {Array.from(new Set(teamSizes))
                  .filter((size) => !isNaN(size))
                  .sort((a, b) => b - a)
                  .map((size) => {
                    const count = teamSizes.filter((s) => s === size).length;
                    return count > 0 ? `[${size}명 * ${count}]` : "";
                  })
                  .filter((text) => text !== "")
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
                onChange={(e) => onShowLadderChange(e.target.checked)}
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
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="moveAllAtOnce"
                checked={moveAllAtOnce}
                onChange={(e) => onMoveAllAtOnceChange(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-300"
              />
              <label htmlFor="moveAllAtOnce" className="text-gray-500">
                모두 함께 이동
              </label>
            </div>

            <label className="block text-gray-700 font-bold mt-3 mb-2">
              이동 속도
            </label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="speedSlow"
                  name="ladderSpeed"
                  value="slow"
                  checked={ladderSpeed === "slow"}
                  onChange={() => onLadderSpeedChange("slow")}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-300"
                />
                <label htmlFor="speedSlow" className="text-gray-500">
                  천천히
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="speedNormal"
                  name="ladderSpeed"
                  value="normal"
                  checked={ladderSpeed === "normal"}
                  onChange={() => onLadderSpeedChange("normal")}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-300"
                />
                <label htmlFor="speedNormal" className="text-gray-500">
                  보통
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="speedFast"
                  name="ladderSpeed"
                  value="fast"
                  checked={ladderSpeed === "fast"}
                  onChange={() => onLadderSpeedChange("fast")}
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-300"
                />
                <label htmlFor="speedFast" className="text-gray-500">
                  빠르게
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onStartGame}
          className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          disabled={participantsCount === 0 || !isTeamSizeSelected}
        >
          사다리 타기 시작!
        </button>
      </div>
    </>
  );
}
