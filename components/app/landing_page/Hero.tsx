"use client";

import Image from "next/image";
import { ChevronRightIcon } from "@heroicons/react/20/solid";


export default function Hero() {

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="relative isolate pt-14">
        <svg
          aria-hidden="true"
          className="absolute inset-0 -z-10 size-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)] dark:stroke-white/10"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-50 dark:fill-gray-800/50">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" width="100%" height="100%" strokeWidth={0} />
        </svg>
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <div className="flex">
              <div className="relative flex items-center gap-x-4 rounded-full bg-white px-4 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10 dark:hover:ring-white/20">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Luis Ruiz</span>
                <span aria-hidden="true" className="h-4 w-px bg-gray-900/10 dark:bg-white/10" />
                <a href="#" className="flex items-center gap-x-1">{/* TODO: Add link to LinkedIn or hire form */}
                  <span aria-hidden="true" className="absolute inset-0" />
                  Available for hire
                  <ChevronRightIcon aria-hidden="true" className="-mr-2 size-5 text-gray-400" />
                </a>
              </div>
            </div>
            <h1 className="mt-10 text-pretty text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl dark:text-white">
              Luis Ruiz: Full-Stack Developer
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8 dark:text-gray-400">
              I'm a full-stack developer with a passion for creating innovative and user-friendly applications. With a strong foundation in both frontend and backend development, I'm dedicated to delivering high-quality solutions that meet the needs of my clients.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
              >
                Contact me
              </a>
              <a href="#" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:shrink-0 lg:grow">
            <div className="mx-auto w-[22.875rem] max-w-full drop-shadow-xl">
              <Image
                src="/luis_businessman-2.png"
                alt="Luis Ruiz portrait"
                width={366}
                height={729}
                className="rounded-3xl border border-black/5 shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
