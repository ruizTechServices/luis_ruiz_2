///C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\components\app\landing_page\githubHeatmap.tsx
'use client';
import Image from 'next/image'

export default function GithubHeatmap() {
  return (
    <Image
      src="https://ghchart.rshah.org/ruizTechServices"
      alt="Luis Giovanni Ruiz's GitHub contributions"
      width={900}
      height={184}
      className="shadow-xl hover:shadow-3xl transition-shadow duration-300"
      unoptimized
    />
  )
}
