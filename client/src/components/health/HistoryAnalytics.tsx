import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon, BarChart3, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function HistoryAnalytics({ dailyStats, records }: { dailyStats: any; records: any[] }) {
  return (
    <div className="rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-2xl mx-2 sm:mx-0" style={{ background: 'linear-gradient(to bottom right, #A9FDAC, #7FE88A, #5DD46E)' }}>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-900 dark:text-gray-900">Your Food Analysis Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/30 dark:bg-white/20 backdrop-blur-sm border-gray-700/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{dailyStats.totalScans}</div>
            <div className="text-sm text-gray-800">Total Scans</div>
          </CardContent>
        </Card>
        <Card className="bg-white/30 dark:bg-white/20 backdrop-blur-sm border-gray-700/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{dailyStats.safeScans}</div>
            <div className="text-sm text-gray-800">Safe Foods</div>
          </CardContent>
        </Card>
        <Card className="bg-white/30 dark:bg-white/20 backdrop-blur-sm border-gray-700/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{dailyStats.riskyScans}</div>
            <div className="text-sm text-gray-800">Risky Foods</div>
          </CardContent>
        </Card>
        <Card className="bg-white/30 dark:bg-white/20 backdrop-blur-sm border-gray-700/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">
              {dailyStats.totalScans > 0 ? Math.round((dailyStats.safeScans / dailyStats.totalScans) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-800">Safe Rate</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/30 dark:bg-white/20 backdrop-blur-sm border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg font-semibold">
              <PieChartIcon className="w-5 h-5" />
              Safety Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[{ name: 'Safe Foods', value: dailyStats.safeScans, color: '#10b981' }, { name: 'Risky Foods', value: dailyStats.riskyScans, color: '#f97316' }]}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={false}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f97316" />
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ fontSize: '12px', color: '#1f2937' }}
                  formatter={(value) => <span className="text-gray-900 font-semibold">{value}</span>}
                />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: 8, color: 'white' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/30 dark:bg-white/20 backdrop-blur-sm border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg font-semibold">
              <BarChart3 className="w-5 h-5" />
              Safety Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{ name: 'Safe Foods', count: dailyStats.safeScans, fill: '#10b981' }, { name: 'Risky Foods', count: dailyStats.riskyScans, fill: '#f97316' }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
                <XAxis dataKey="name" stroke="rgba(0,0,0,0.9)" tick={{ fill: 'rgba(0,0,0,0.9)', fontSize: 12 }} />
                <YAxis stroke="rgba(0,0,0,0.9)" tick={{ fill: 'rgba(0,0,0,0.9)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: 8, color: 'white' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  <Cell fill="#10b981" />
                  <Cell fill="#f97316" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/30 dark:bg-white/20 backdrop-blur-sm border-gray-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg font-semibold">
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" />
                <XAxis dataKey="name" stroke="rgba(0,0,0,0.9)" tick={{ fill: 'rgba(0,0,0,0.9)', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="rgba(0,0,0,0.9)" tick={{ fill: 'rgba(0,0,0,0.9)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', border: 'none', borderRadius: 8, color: 'white' }} />
                <Bar dataKey="value" fill="#fb923c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}