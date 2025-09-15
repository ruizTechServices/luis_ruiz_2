
import Image from 'next/image'

export default function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Image 
              src="/portrait-gio.jpg" 
              alt="Portrait of Gio (Luis Giovanni Ruiz)" 
              className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white shadow-lg"
            />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-xl text-blue-100 mb-6">
              Partner with Gio (Luis Giovanni Ruiz), a Bronx-born bilingual full-stack AI engineer
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">24Hour-AI</div>
                <div className="text-sm text-blue-100">Flagship Product</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">&lt;200ms</div>
                <div className="text-sm text-blue-100">Latency</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">99.9%</div>
                <div className="text-sm text-blue-100">Uptime</div>
              </div>
            </div>
            
            <blockquote className="text-2xl font-semibold text-white mb-6 italic">
              &quot;Learn → Build → Ship → Iterate.&quot;
            </blockquote>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['JavaScript', 'Python', 'React', 'Next.js', 'Node.js', 'PHP', 'Tailwind CSS', 'Linux'].map((tech) => (
                <span key={tech} className="px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4 md:space-y-0 md:flex md:gap-6 md:justify-center">
            <button className="w-full md:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-4 px-8 rounded-full text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start Your Project Today
            </button>
            <button className="w-full md:w-auto border-2 border-white text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-white hover:text-purple-900 transition-all duration-300">
              View Portfolio
            </button>
          </div>
          
          <p className="text-blue-200 mt-6 text-sm">
            RuizTechServices LLC • Enterprise-grade AI solutions since 2024
          </p>
        </div>
      </div>
    </section>
  );
}
