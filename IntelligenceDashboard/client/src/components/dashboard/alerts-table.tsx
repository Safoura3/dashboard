import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, ExternalLink, Download, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import type { Veille } from "@shared/schema";

interface AlertsTableProps {
  alerts: Veille[];
  isLoading: boolean;
}

export default function AlertsTable({ alerts, isLoading }: AlertsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(alerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlerts = alerts.slice(startIndex, endIndex);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "en vigueur": return "default";
      case "en cours": return "secondary";
      case "projet": return "outline";
      default: return "secondary";
    }
  };

  const getSentimentVariant = (sentiment: string) => {
    switch (sentiment) {
      case "positif": return "default";
      case "négatif": return "destructive";
      case "neutre": return "secondary";
      default: return "secondary";
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 8) return "bg-red-500";
    if (score >= 6) return "bg-orange-500";
    if (score >= 4) return "bg-blue-500";
    return "bg-slate-400";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "en vigueur": return <CheckCircle className="h-3 w-3" />;
      case "en cours": return <Clock className="h-3 w-3" />;
      case "projet": return <AlertTriangle className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Alertes Récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
            Alertes Récentes
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Sentiment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {currentAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-slate-500 dark:text-slate-400">
                      Aucune alerte trouvée
                    </p>
                  </td>
                </tr>
              ) : (
                currentAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {alert.content.slice(0, 60)}...
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-md">
                          {alert.content}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {alert.keywords ? (
                            (() => {
                              try {
                                const keywordArray = JSON.parse(alert.keywords);
                                return Array.isArray(keywordArray) ? keywordArray.slice(0, 2).map((keyword: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
                                  >
                                    {keyword}
                                  </Badge>
                                )) : <span className="text-xs text-slate-400">{alert.keywords}</span>;
                              } catch {
                                return <span className="text-xs text-slate-400">{alert.keywords}</span>;
                              }
                            })()
                          ) : (
                            <span className="text-xs text-slate-400">Aucun mot-clé</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(alert.status)} className="inline-flex items-center gap-1">
                        {getStatusIcon(alert.status)}
                        {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getSentimentVariant(alert.sentiment)}>
                        {alert.sentiment.charAt(0).toUpperCase() + alert.sentiment.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getPriorityColor(alert.priority_score)}`}
                            style={{ width: `${alert.priority_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {alert.priority_score}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date().toLocaleDateString("fr-FR")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={alert.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Affichage de <span className="font-medium">{startIndex + 1}</span> à{" "}
                <span className="font-medium">{Math.min(endIndex, alerts.length)}</span> sur{" "}
                <span className="font-medium">{alerts.length}</span> résultats
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
