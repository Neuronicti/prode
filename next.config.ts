import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin', 'google-auth-library', '@google-cloud/firestore'],
};

export default nextConfig;
