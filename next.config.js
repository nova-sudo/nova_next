import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  experimental: {
    outputFileTracing: true,
    outputStandalone: true,
    disableOptimizedLoading: false,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /rehype-prism-plus/,
      type: "javascript/auto",
    });
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withBundleAnalyzer(nextConfig);
