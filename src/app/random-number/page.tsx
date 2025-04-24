"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function RandomNumberPage() {
  const [minNumber, setMinNumber] = useState<number | null>(null);
  const [maxNumber, setMaxNumber] = useState<number | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [animatingNumber, setAnimatingNumber] = useState<number | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // 유효성 검사
  const minValue = minNumber ?? 1;
  const maxValue = maxNumber ?? 10;
  const countValue = count ?? 1;

  const isValid =
    minValue <= maxValue &&
    countValue > 0 &&
    countValue <= maxValue - minValue + 1;
  const errorMessage = !isValid
    ? minValue > maxValue
      ? "시작 번호는 끝 번호보다 작거나 같아야 합니다."
      : countValue <= 0
      ? "최소 1개 이상 뽑아야 합니다."
      : "뽑을 개수는 가능한 숫자 범위보다 작거나 같아야 합니다."
    : "";

  // 번호 뽑기 함수
  const drawNumbers = () => {
    if (!isValid || isDrawing) return;

    // 비어있는 입력 필드는 기본값으로 처리
    const min = minNumber ?? 1;
    const max = maxNumber ?? 10;
    const drawCount = count ?? 1;

    setIsDrawing(true);
    setAnimationComplete(false);
    setDrawnNumbers([]);

    // 가능한 모든 숫자 배열 생성
    const allNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    // 숫자 섞기 (Fisher-Yates 알고리즘)
    for (let i = allNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
    }

    // 필요한 개수만 선택
    const selectedNumbers = allNumbers
      .slice(0, drawCount)
      .sort((a, b) => a - b);

    if (showAnimation) {
      // 애니메이션 동작
      const animationSpeed = 40; // 각 번호당 애니메이션 시간 (ms) - 고정값

      let currentNumberIndex = 0;
      let currentCycle = 0;

      const animationInterval = setInterval(() => {
        // 모든 번호 애니메이션 완료
        if (currentNumberIndex >= drawCount) {
          clearInterval(animationInterval);
          setAnimatingNumber(null);
          setAnimationComplete(true);
          setIsDrawing(false);
          setDrawnNumbers(selectedNumbers);
        }

        // 랜덤 숫자로 애니메이션
        const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
        setAnimatingNumber(randomNum);

        currentCycle++;

        // 현재 번호의 애니메이션 완료
        if (currentCycle >= animationSpeed) {
          // 선택된 번호 표시
          setDrawnNumbers((prev) => [
            ...prev,
            selectedNumbers[currentNumberIndex],
          ]);
          currentNumberIndex++;
          currentCycle = 0;
        }
      }, animationSpeed);
    } else {
      // 애니메이션 없이 바로 결과 표시
      setDrawnNumbers(selectedNumbers);
      setIsDrawing(false);
      setAnimationComplete(true);
    }
  };

  // 결과가 나오면 자동 스크롤
  useEffect(() => {
    if (animationComplete && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [animationComplete]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <header className="text-center mb-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2">
            <img src="/favicon.ico" alt="신한 로고" className="w-8 h-8" />
            <h1 className="text-3xl font-bold text-blue-600 mb-2">
              랜덤 번호 뽑기
            </h1>
            <img src="/favicon.ico" alt="신한 로고" className="w-8 h-8" />
          </div>
          <p className="text-gray-600">
            원하는 범위에서 랜덤 번호를 뽑아보세요!
          </p>
        </div>
        <div className="flex justify-end mt-4">
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition"
          >
            🪜 사다리 게임으로 돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-5 text-blue-600">
            번호 설정
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                시작 번호
              </label>
              <input
                type="number"
                value={minNumber === null ? "" : minNumber}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? null : parseInt(e.target.value);
                  setMinNumber(value);
                }}
                placeholder="1"
                className="text-gray-800 w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                끝 번호
              </label>
              <input
                type="number"
                value={maxNumber === null ? "" : maxNumber}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? null : parseInt(e.target.value);
                  setMaxNumber(value);
                }}
                placeholder="10"
                className="text-gray-800 w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">
                뽑을 개수
              </label>
              <input
                type="number"
                value={count === null ? "" : count}
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? null : parseInt(e.target.value);
                  setCount(value);
                }}
                placeholder="1"
                className="text-gray-800 w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showAnimation"
                checked={showAnimation}
                onChange={(e) => setShowAnimation(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-300"
              />
              <label htmlFor="showAnimation" className="text-gray-700">
                번호 추첨 애니메이션 표시
              </label>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-100 text-red-800 rounded mb-4">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="text-center mt-8">
            <button
              onClick={drawNumbers}
              disabled={!isValid || isDrawing}
              className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDrawing ? "뽑는 중..." : "번호 뽑기"}
            </button>
          </div>
        </div>

        {(isDrawing || animationComplete) && (
          <div className="bg-white p-6 rounded-lg shadow-md" ref={resultRef}>
            <h2 className="text-xl font-semibold mb-5 text-blue-600">
              {isDrawing ? "번호 추첨 중..." : "추첨 결과"}
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {drawnNumbers.map((number, index) => (
                <div
                  key={index}
                  className="w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full border-4 border-blue-500"
                >
                  <span className="text-2xl font-bold text-blue-700">
                    {number}
                  </span>
                </div>
              ))}

              {isDrawing && animatingNumber !== null && showAnimation && (
                <div className="w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full border-4 border-blue-500 animate-pulse">
                  <span className="text-2xl font-bold text-blue-700">
                    {animatingNumber}
                  </span>
                </div>
              )}
            </div>

            {animationComplete && (
              <div className="mt-6 text-center">
                <button
                  onClick={drawNumbers}
                  className="bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  다시 뽑기
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center mt-12 text-gray-500 text-sm">
        ©{" "}
        <a
          href="https://github.com/jjweidon/shsadari"
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
