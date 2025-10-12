// components/app/landing_page/techSection.tsx
import Image from 'next/image';
import { skills } from './skills';
import GithubHeatmap from './githubHeatmap';

const TechSection = () => {
  return (
    <section className=" relative py-16 md:py-24 lg:py-32">
      {/* Clean neutral background */}
      <div className="h-[700vh] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section with plastic card effect */}
        <div className="text-center mb-12 md:mb-16 space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 drop-shadow-lg">
            Tech Stack
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto px-4 font-medium">
            Building scalable and production-ready systems with modern technologies
          </p>
        </div>

        {/* GitHub Heatmap Section - Plastic card */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="relative group">
            {/* Subtle glow on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500" />
            
            <div className="hidden md:flex flex-col relative items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] p-4 sm:p-6 md:p-8 border border-white/50 dark:border-gray-700/50">
              {/* Top glossy highlight */}
              <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
              
              {/* Side shine effect */}
              <div className="absolute top-0 left-0 w-px h-1/2 bg-gradient-to-blue/70 from-white/70 dark:from-white/10 to-transparent" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Luis&apos;s GitHub Heatmap</h1>
              <GithubHeatmap />
              
              {/* Bottom subtle reflection */}
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/5 dark:from-black/20 to-transparent pointer-events-none rounded-b-2xl" />
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="relative">
          {/* Section subtitle in plastic badge */}
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-block px-6 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-full border border-white/50 dark:border-gray-700/50 shadow-[0_4px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
              <p className="text-sm sm:text-base uppercase tracking-wider text-gray-800 dark:text-gray-200 font-bold">
                Technologies & Tools
              </p>
            </div>
          </div>

          {/* Responsive Grid with plastic cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
            {skills.map((skill, index) => (
              <div
                key={skill.name}
                className="group relative"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                }}
              >
                {/* Subtle glow effect on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-2xl opacity-0 group-hover:opacity-50 blur transition duration-500" />
                
                {/* Main plastic card */}
                <div className="
                  relative
                  bg-white/80 dark:bg-gray-800/80
                  backdrop-blur-xl
                  rounded-xl sm:rounded-2xl
                  p-4 sm:p-5 md:p-6
                  shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)]
                  dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
                  group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8)]
                  dark:group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]
                  transition-all duration-300
                  group-hover:-translate-y-2
                  group-hover:scale-105
                  border border-white/50 dark:border-gray-700/50
                  overflow-hidden
                ">
                  {/* Top shine highlight */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/90 dark:via-white/20 to-transparent" />
                  
                  {/* Side shine effect */}
                  <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-white/70 dark:from-white/10 via-white/30 dark:via-white/5 to-transparent" />
                  
                  {/* Icon Container with glossy effect */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="
                      relative 
                      w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                      flex items-center justify-center
                      rounded-xl
                      bg-gradient-to-br from-white/95 to-gray-100/95 
                      dark:from-gray-700/95 dark:to-gray-650/95
                      shadow-[inset_0_2px_8px_rgba(255,255,255,0.9),0_4px_16px_rgba(0,0,0,0.1),inset_0_-2px_4px_rgba(0,0,0,0.05)]
                      dark:shadow-[inset_0_2px_8px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(0,0,0,0.3)]
                      group-hover:shadow-[inset_0_2px_12px_rgba(255,255,255,1),0_8px_24px_rgba(0,0,0,0.15),inset_0_-2px_4px_rgba(0,0,0,0.08)]
                      dark:group-hover:shadow-[inset_0_2px_12px_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.5),inset_0_-2px_4px_rgba(0,0,0,0.4)]
                      transition-all duration-300
                      border border-white/60 dark:border-gray-600/60
                    ">
                      {/* Inner glossy highlight - top left */}
                      <div className="absolute top-1 left-1 right-1/2 bottom-1/2 bg-gradient-to-br from-white/70 dark:from-white/15 to-transparent rounded-tl-xl pointer-events-none" />
                      
                      {/* Inner shadow - bottom right */}
                      <div className="absolute bottom-1 right-1 left-1/2 top-1/2 bg-gradient-to-tl from-black/10 dark:from-black/30 to-transparent rounded-br-xl pointer-events-none" />
                      
                      <Image 
                        src={skill.logo} 
                        alt={skill.name}
                        width={40}
                        height={40}
                        className="relative z-10 object-contain w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md"
                      />
                    </div>
                    
                    {/* Skill Name */}
                    <p className="
                      text-xs sm:text-sm md:text-base
                      font-bold
                      text-gray-800 dark:text-gray-100
                      text-center
                      line-clamp-1
                      group-hover:text-gray-900 dark:group-hover:text-white
                      transition-all duration-300
                    ">
                      {skill.name}
                    </p>
                  </div>

                  {/* Bottom glossy reflection */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/5 dark:from-black/20 to-transparent pointer-events-none rounded-b-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section - Plastic cards */}
        <div className="mt-12 md:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { value: `${skills.length}+`, label: 'Technologies' },
            { value: '100%', label: 'Production Ready' },
            { value: '24/7', label: 'Scalable Systems' }
          ].map((stat, idx) => (
            <div key={idx} className="relative group">
              {/* Subtle outer glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-300" />
              
              {/* Plastic card */}
              <div className="relative text-center p-6 sm:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/50 dark:border-gray-700/50 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                {/* Top shine */}
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
                
                {/* Side shine */}
                <div className="absolute top-0 left-0 w-px h-1/2 bg-gradient-to-b from-white/70 dark:from-white/10 to-transparent" />
                
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 drop-shadow-lg">
                  {stat.value}
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mt-3 font-semibold">
                  {stat.label}
                </p>
                
                {/* Bottom reflection */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/5 dark:from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechSection;