import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
 
  webpack: (config) => {
    config.module.rules.push({
      test: /rehype-prism-plus/,
      type: "javascript/auto",
    });
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
