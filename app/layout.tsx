import "./globals.css";
import { Inter } from "next/font/google";
import { SuperTokensProvider } from "../src/components/SupertokensProvider";
import { UserProvider } from "../src/contexts/UserContext";
import RootClientLayout from "./RootClientLayout";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="description"
          content="Innovative research solution. A powerful platform designed to assist scientists, researchers, professors, and students in generating and refining innovative solutions to real-world problems. Utilizing AI and machine learning, it facilitates the creation, improvement, and sharing of research hypotheses based on scientific literature."
        />
        <meta
          name="keywords"
          content="SeeChat x Ideas, scientific brainstorming, collaboration platform, STEAM creativity, technologists, scientists, students, innovation, productivity, creative tools, brainstorming techniques, ideation, implementation, transformative technology"
        />
        <meta
          name="author"
          content="Holistic Intelligence for Global Good LLC"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
        <title>SeeChat x Ideas</title>
      </head>
      <body className={inter.className}>
        <SuperTokensProvider>
          <UserProvider>
            <RootClientLayout>{children}</RootClientLayout>
          </UserProvider>
        </SuperTokensProvider>
      </body>
    </html>
  );
}
