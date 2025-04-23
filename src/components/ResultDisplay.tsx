import React from "react";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/outline";
import { TeamResult } from "../utils/ladder";

interface ResultDisplayProps {
  results: {
    teamResults: Record<string, TeamResult>;
  };
  copied: boolean;
  onCopyResults: () => void;
  onResetGame: () => void;
}

export default function ResultDisplay({
  results,
  copied,
  onCopyResults,
  onResetGame,
}: ResultDisplayProps) {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-600">결과</h2>
        <button
          onClick={onCopyResults}
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
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
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
          onClick={onResetGame}
          className="bg-blue-500 font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          다시 하기
        </button>
      </div>
    </div>
  );
}
