// components/app/landing_page/techSection.tsx
import Image from 'next/image';
import { skills } from './skills';
import GithubHeatmap from './githubHeatmap';

const TechSection = () => {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Tech Stack
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
            Building scalable and production-ready systems with modern technologies
          </p>
        </div>

        {/* GitHub Heatmap Section */}
        <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 transition-all duration-300 hover:shadow-xl">
            <GithubHeatmap />
          </div>
        </div>

        {/* Skills Grid */}
        <div className="relative">
          {/* Section subtitle */}
          <div className="text-center mb-8 md:mb-10">
            <p className="text-sm sm:text-base uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              Technologies & Tools
            </p>
          </div>

          {/* Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {skills.map((skill, index) => (
              <div
                key={skill.name}
                className="group relative"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                }}
              >
                <div className="
                  relative
                  bg-gray-50 dark:bg-gray-800
                  rounded-lg sm:rounded-xl
                  p-4 sm:p-5 md:p-6
                  shadow-sm hover:shadow-xl
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:scale-105
                  border border-gray-100 dark:border-gray-700
                  hover:border-gray-200 dark:hover:border-gray-600
                  cursor-pointer
                ">
                  {/* Icon Container */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="
                      relative 
                      w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 
                      flex items-center justify-center
                      rounded-lg
                      bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600
                      group-hover:from-blue-50 group-hover:to-blue-100
                      dark:group-hover:from-blue-900/30 dark:group-hover:to-blue-800/30
                      transition-all duration-300
                    ">
                      <Image 
                        src={skill.logo} 
                        alt={skill.name}
                        width={40}
                        height={40}
                        className="object-contain w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Skill Name */}
                    <p className="
                      text-xs sm:text-sm md:text-base
                      font-medium
                      text-gray-700 dark:text-gray-200
                      text-center
                      line-clamp-1
                      group-hover:text-blue-600 dark:group-hover:text-blue-400
                      transition-colors duration-300
                    ">
                      {skill.name}
                    </p>
                  </div>

                  {/* Hover effect decoration */}
                  <div className="
                    absolute inset-0 
                    bg-gradient-to-r from-blue-500 to-purple-500 
                    opacity-0 group-hover:opacity-10 
                    rounded-lg sm:rounded-xl 
                    transition-opacity duration-300
                  " />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional: Stats or additional info */}
        <div className="mt-12 md:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
              {skills.length}+
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
              Technologies
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">
              100%
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
              Production Ready
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">
              24/7
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">
              Scalable Systems
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechSection;