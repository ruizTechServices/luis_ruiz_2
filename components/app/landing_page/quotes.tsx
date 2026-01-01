import React from 'react';

const Quote = () => {
  return (
    <blockquote className="p-4 sm:p-6 md:p-8 text-center mx-auto w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 my-8 sm:my-12 md:my-16 lg:my-20">
      <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold border-l-2 sm:border-l-4 border-gray-600 pl-3 sm:pl-4 md:pl-6 text-left leading-relaxed">
        &ldquo;I push production forward while scaling systems; Leveraging the power of modern technologies to build scalable, performant, and maintainable systems that drive business growth and customer satisfaction&rdquo;
      </p>
      <footer className="text-xs sm:text-sm md:text-base text-gray-600 mt-3 sm:mt-4 text-left pl-3 sm:pl-4 md:pl-6">
        <span className="font-semibold">Luis Ruiz</span>
      </footer>
    </blockquote>
  );
};

export default Quote;