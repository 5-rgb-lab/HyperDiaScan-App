import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon, BarChart3, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function HistoryAnalytics({ dailyStats, records }: { dailyStats: any; records: any[] }) {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Your Food Analysis Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-300">{dailyStats.totalScans}</div>
            <div className="text-sm text-blue-100">Total Scans</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-300">{dailyStats.safeScans}</div>
            <div className="text-sm text-blue-100">Safe Foods</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-red-300">{dailyStats.riskyScans}</div>
            <div className="text-sm text-blue-100">Risky Foods</div>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-300">
              {dailyStats.totalScans > 0 ? Math.round((dailyStats.safeScans / dailyStats.totalScans) * 100) : 0}%
            </div>
            <div className="text-sm text-blue-100">Safe Rate</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <PieChartIcon className="w-5 h-5" />
              Safety Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[{ name: 'Safe Foods', value: dailyStats.safeScans, color: '#10b981' }, { name: 'Risky Foods', value: dailyStats.riskyScans, color: '#ef4444' }]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    if (dailyStats.totalScans === 0) return '';
                    return `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: 8, color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <BarChart3 className="w-5 h-5" />
              Safety Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{ name: 'Safe Foods', count: dailyStats.safeScans, fill: '#10b981' }, { name: 'Risky Foods', count: dailyStats.riskyScans, fill: '#ef4444' }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: 8, color: 'white' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <TrendingUp className="w-5 h-5" />
              Avg. Nutrients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(() => {
                const nutrientTotals: Record<string, number> = {};
                const nutrientCounts: Record<string, number> = {};
                records.forEach(record => {
                  Object.entries(record.nutritionData || {}).forEach(([key, value]) => {
                    if (!nutrientTotals[key]) {
                      nutrientTotals[key] = 0;
                      nutrientCounts[key] = 0;
                    }
                    nutrientTotals[key] += Number(value || 0);
                    nutrientCounts[key] += 1;
                  });
                });

                return Object.entries(nutrientTotals)
                  .map(([key, total]) => ({ name: key.length > 8 ? key.substring(0, 8) + '...' : key, value: Math.round(total / (nutrientCounts[key] || 1)) }))
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 6);
              })()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: 8, color: 'white' }} />
                <Bar dataKey="value" fill="#fbbf24" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
