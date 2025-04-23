import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript 체크 오류가 발생해도 빌드 계속 진행
  typescript: {
    // !! 주의: Vercel 배포 시에만 사용하고, 일반적인 개발에서는 false로 설정하는 것이 좋습니다.
    ignoreBuildErrors: true,
  },
  // ESLint 오류가 발생해도 빌드 계속 진행
  eslint: {
    // !! 주의: Vercel 배포 시에만 사용하고, 일반적인 개발에서는 false로 설정하는 것이 좋습니다.
    ignoreDuringBuilds: true,
  },
  // 빌드 출력 내용 자세히 표시
  output: "standalone",
} as NextConfig;

export default nextConfig;
