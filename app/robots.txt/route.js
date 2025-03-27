// app/robots.txt/route.js
export async function GET() {
  const robotsContent = `User-agent: *
Allow: /
Allow: /ideas/
Allow: /idea/
Allow: /topics/
Disallow: /profile/
Disallow: /credits/
Sitemap: https://seechat.ai/sitemap.xml`;

  return new Response(robotsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
