import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Veille } from "@shared/schema";

interface ChartsSectionProps {
  veilleItems: Veille[];
}

export default function ChartsSection({ veilleItems }: ChartsSectionProps) {
  const sentimentData = useMemo(() => {
    const sentiments = veilleItems.reduce((acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sentiments).map(([sentiment, count]) => ({
      sentiment: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
      count,
      color: sentiment === "positif" ? "#22c55e" : sentiment === "négatif" ? "#ef4444" : "#8b5cf6",
    }));
  }, [veilleItems]);

  const priorityData = useMemo(() => {
    const priorities = veilleItems.reduce((acc, item) => {
      const range = item.priority_score <= 3 ? "1-3" : 
                   item.priority_score <= 6 ? "4-6" : 
                   item.priority_score <= 8 ? "7-8" : "9-10";
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(priorities).map(([range, count]) => ({
      range,
      count,
    }));
  }, [veilleItems]);

  const COLORS = ["#22c55e", "#ef4444", "#8b5cf6"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sentiment Chart */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Répartition par Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {sentimentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ sentiment, count }) => `${sentiment}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 dark:text-slate-400">Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Priority Chart */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Scores de Priorité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fill: 'currentColor' }}
                    className="text-slate-600 dark:text-slate-400"
                  />
                  <YAxis 
                    tick={{ fill: 'currentColor' }}
                    className="text-slate-600 dark:text-slate-400"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 dark:text-slate-400">Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
