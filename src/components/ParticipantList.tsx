import React from "react";
import { Participant } from "../utils/ladder";

interface ParticipantListProps {
  participants: Participant[];
  isPlaying: boolean;
  showLimitWarning: boolean;
  onAddParticipant: () => void;
  onUpdateQueryString: () => void;
}

export default function ParticipantList({
  participants,
  isPlaying,
  showLimitWarning,
  onAddParticipant,
  onUpdateQueryString,
}: ParticipantListProps) {
  return (
    <div className={`mb-6 ${isPlaying ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center mb-4 gap-2">
        <div className="flex-1">
          <h2 className="text-sm sm:text-xl font-semibold text-blue-600">
            참가자 목록
          </h2>
          <p className="hidden sm:block text-sm text-gray-500">
            URL에 data=이름1,이름2,... 형식으로 참가자를 추가할 수 있습니다.
          </p>
        </div>
        <button
          onClick={onAddParticipant}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
          disabled={isPlaying}
        >
          참가자 추가
        </button>
        <button
          onClick={onUpdateQueryString}
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

      {participants.length > 0 ? (
        <>
          <p className="mb-2 text-gray-700">
            총 참가자: {participants.length}명
          </p>
          <div
            className={`grid ${
              participants.length > 50
                ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6"
                : participants.length > 20
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
            } gap-2 mb-6 overflow-y-auto max-h-80`}
          >
            {participants.map((participant, index) => (
              <div
                key={index}
                className="flex items-center p-2 border rounded text-sm"
                style={{ backgroundColor: participant.color }}
              >
                <span className="mr-1 text-lg">{participant.character}</span>
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
  );
}
