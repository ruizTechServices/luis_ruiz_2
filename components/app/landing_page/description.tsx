import React from 'react';

export default function Description() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Unleash the Power of AI
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience the future of intelligent automation with our cutting-edge AI platform. 
            Transform your workflow, amplify your creativity, and unlock unprecedented possibilities.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="group p-8 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <div className="w-6 h-6 bg-primary rounded-sm"></div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Lightning Fast</h3>
            <p className="text-muted-foreground leading-relaxed">
              Process complex queries in milliseconds with our optimized AI engine. 
              Experience real-time responses that keep your workflow seamless.
            </p>
          </div>
          
          <div className="group p-8 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <div className="w-6 h-6 bg-primary rounded-sm"></div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Always Learning</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our AI continuously evolves and adapts to your needs, becoming smarter 
              with every interaction to deliver personalized experiences.
            </p>
          </div>
          
          <div className="group p-8 rounded-lg border bg-card hover:bg-accent/50 transition-all duration-300 hover:scale-105 md:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <div className="w-6 h-6 bg-primary rounded-sm"></div>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Secure & Private</h3>
            <p className="text-muted-foreground leading-relaxed">
              Your data stays protected with enterprise-grade security. We prioritize 
              privacy while delivering powerful AI capabilities you can trust.
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <span className="text-sm font-medium text-primary">✨ Trusted by 10,000+ users worldwide</span>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join the growing community of innovators who are transforming their work with AI. 
            From startups to enterprises, our platform scales with your ambitions.
          </p>
        </div>
      </div>
    </section>
  );
}
