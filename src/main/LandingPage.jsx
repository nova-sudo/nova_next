"use client";
import { SocialLinks } from "../components/LandingPageData";
import routes from "../routes";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col relative isolate overflow-hidden bg-gray-900 min-h-screen">
      <div className="flex-grow flex items-center justify-center mx-auto">
        <svg
          className="absolute inset-0 -z-10 h-full w-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="983e3e4c-de6d-4c3f-8d64-b9761d1534cc"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-800/20">
            <path
              d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            width="100%"
            height="100%"
            strokeWidth={0}
            fill="url(#983e3e4c-de6d-4c3f-8d64-b9761d1534cc)"
          />
        </svg>
        <div
          className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
          aria-hidden="true"
        >
          <div
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20"
            style={{
              clipPath:
                "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
            }}
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32 py:5 lg:flex lg:px-8 lg:py-20 ">
          <div className="mt-32 mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
            <div className="w-max">
              <h1 className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-5 text-4xl sm:text-5xl text-white font-bold mt-4">
                SeeChat <span className="text-[#F22749]">x Ideas</span>
              </h1>
            </div>

            <p className="mt-6 mr-10 text-lg leading-8 text-gray-300">
              Instant expertise, endless possibilities. Accelerate discovery
              with every search. Make every research project a breakthrough.
            </p>
            <div className="mt-5 mb-5 flex flex-col sm:flex-row sm:space-x-4">
              <Link
                href={routes.auth}
                rel="noopener noreferrer"
                data-testid="landing-page-login"
                className="rounded-full mb-4 sm:mb-0 bg-red-500/10 px-4 py-3 text-lg font-semibold leading-6 text-red-400 ring-2 ring-inset ring-red-500/20 max-w-80
                 "
              >
                Login to SeeChat x Ideas
              </Link>
              <Link
                href={routes.ideas}
                rel="noopener noreferrer"
                data-testid="landing-page-login"
                className="rounded-full bg-blue-500/10 px-4 py-3 text-lg font-semibold leading-6 text-blue-400 ring-2 ring-inset ring-blue-500/20 max-w-60"
              >
                Continue as Guest
              </Link>
            </div>
            <div className="flex items-center gap-x-6">
              <div className="sm:mt-5 mt-2 flex justify-center space-x-10">
                {SocialLinks.social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target={item.target}
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </a>
                ))}
              </div>
              <a
                href="https://github.com/higgood/seechat-folks"
                className="inline-flex mt-5 space-x-6"
              >
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                  Contribute on GitHub
                </span>
              </a>
            </div>
          </div>
          <div className="max-h-full px-4 bg-white/5 mt-5 sm:px-8 md:px-16 lg:px-36 rounded-lg flex flex-col justify-end h-auto ">
            <div className="flex justify-center  "></div>
          </div>
        </div>
      </div>
      <div className="mx-auto shadow-2xl ring-1 ring-gray-700 rounded-t-3xl shadow-white w-full overflow-hidden bg-white/10 px-6 py-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center sm:text-left text-xs text-gray-500">
          <div className="space-y-2">
            <p>&copy; 2024 Holistic Intelligence for Global Good LLC.</p>
            <p>9330 NE Juanita Dr. #403, Kirkland WA</p>
            <p className="text-gray-400">Version 1.0.15</p>
          </div>
          <div className="space-y-2">
            <p>
              ✉️{" "}
              <a href="mailto:wammar@seechat.ai" className="hover:underline">
                wammar@seechat.ai
              </a>
            </p>
            <p>
              🌐{" "}
              <Link href={routes.landingPage} className="hover:underline">
                seechat.ai
              </Link>
            </p>
            <p>📞 425-999-7289</p>
          </div>
        </div>
      </div>
    </div>
  );
}
