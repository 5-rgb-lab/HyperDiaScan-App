import React from 'react';
import { Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function HomeHero({ userProfile }: { userProfile?: any }) {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 dark:from-blue-700 dark:via-purple-700 dark:to-teal-700 rounded-2xl p-8 md:p-12 text-white shadow-2xl overflow-hidden relative">
      <div className="relative text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
            <Activity className="w-16 h-16 text-white" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl md:text-6xl font-bold">HyperDiaSense</h1>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm px-3 py-1">🤖 AI-Powered</Badge>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-sm px-3 py-1">📊 Nutritional Analysis</Badge>
          </div>
        </div>

        <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed">
          AI-Driven Nutritional Label Analysis System for People with Hypertension and Diabetes
        </p>

        {userProfile?.name && (
          <p className="text-white/80 text-lg">Welcome back, <span className="font-semibold">{userProfile.name}</span>! Track your health journey with smart food analysis.</p>
        )}

        <div className="pt-4">
          <Link href="/scanner">
            <Button className="bg-white text-blue-600 hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
              Analyze Food Now
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 max-w-3xl mx-auto">
          {[{ icon: '💡', title: 'Personalized AI Insights', desc: 'Tailored recommendations for your health' }, { icon: '📈', title: 'Track Progress', desc: 'Monitor your health journey' }].map((feature, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-white/80 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
