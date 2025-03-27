// app/api/sitemap.xml/route.js
import { SitemapStream, streamToPromise } from "sitemap";
import { createGzip } from "zlib";

export const dynamic = "force-dynamic"; // Force dynamic rendering

export async function GET(req) {
  try {
    // Extract hostname and port dynamically
    const hostname = req.headers.host || "localhost:3000"; // Fallback to localhost:3000 in dev
    const protocol = req.headers["x-forwarded-proto"] || "http"; // Use forwarded protocol or default to http
    const baseUrl = `${protocol}://${hostname}`;

    // Create sitemap stream with dynamic hostname
    const smStream = new SitemapStream({
      hostname: baseUrl,
    });

    // Fetch dynamic links from backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/idea/sitemap-links`,
    );
    const links = await response.json();

    // Add static pages
    links.static_pages.forEach((page) => smStream.write(page));

    // Add idea pages
    links.idea_pages.forEach((page) => smStream.write(page));

    // Add topic pages
    links.topic_pages.forEach((page) => smStream.write(page));

    smStream.end();

    // Generate XML
    const xmlString = await streamToPromise(smStream).then((data) =>
      data.toString(),
    );

    // Create gzip response
    const gzip = createGzip();
    const gzipPromise = new Promise((resolve) => {
      const buffers = [];
      gzip.on("data", (buf) => buffers.push(buf));
      gzip.on("end", () => resolve(Buffer.concat(buffers)));
      gzip.write(xmlString);
      gzip.end();
    });

    const gzippedContent = await gzipPromise;

    // Return response
    return new Response(gzippedContent, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Content-Encoding": "gzip",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
