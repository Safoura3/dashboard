import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Smile, Globe } from "lucide-react";
import type { Veille } from "@shared/schema";

interface KPICardsProps {
  veilleItems: Veille[];
}

export default function KPICards({ veilleItems }: KPICardsProps) {
  const kpiData = useMemo(() => {
    const totalItems = veilleItems.length;
    const highPriorityItems = veilleItems.filter(item => item.priority_score >= 80).length;
    const positiveItems = veilleItems.filter(item => item.sentiment === "positif").length;
    const activeSources = new Set(veilleItems.map(item => {
      try {
        return new URL(item.link).hostname;
      } catch {
        return item.link;
      }
    })).size;
    
    const positivePercentage = totalItems > 0 ? Math.round((positiveItems / totalItems) * 100) : 0;
    
    return {
      totalItems,
      highPriorityItems,
      positiveItems,
      activeSources,
      positivePercentage
    };
  }, [veilleItems]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Veille
              </p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
                {kpiData.totalItems}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              +12%
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
              vs mois dernier
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Priorité Élevée
              </p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
                {kpiData.highPriorityItems}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-sm text-red-600 dark:text-red-400 font-medium">
              +3
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
              nouvelles aujourd'hui
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Sentiment Positif
              </p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
                {kpiData.positiveItems}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <Smile className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              {kpiData.positivePercentage}%
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
              du total
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Sources Actives
              </p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
                {kpiData.activeSources}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              98%
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
              disponibilité
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
