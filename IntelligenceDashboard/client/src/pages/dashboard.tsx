import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Veille } from "@shared/schema";
import Sidebar from "@/components/dashboard/sidebar";
import KPICards from "@/components/dashboard/kpi-cards";
import FilterBar from "@/components/dashboard/filter-bar";
import ChartsSection from "@/components/dashboard/charts-section";
import VeilleTable from "@/components/dashboard/veille-table";

import { Button } from "@/components/ui/button";
import { RefreshCw, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("tous");
  const [selectedSentiment, setSelectedSentiment] = useState("tous");
  const [selectedDateRange, setSelectedDateRange] = useState("tous");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const {
    data: veilleItems = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Veille[]>({
    queryKey: ["/api/veille"],
  });

  const filteredVeille = useMemo(() => {
    return veilleItems.filter((item) => {
      const matchesSearch =
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.keywords && item.keywords.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = selectedStatus === "tous" || item.status === selectedStatus;
      const matchesSentiment = selectedSentiment === "tous" || item.sentiment === selectedSentiment;

      return matchesSearch && matchesStatus && matchesSentiment;
    });
  }, [veilleItems, searchTerm, selectedStatus, selectedSentiment]);

  const handleRefresh = async () => {
    await refetch();
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Erreur de chargement
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Impossible de charger les données de veille.
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Dashboard Veille
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Dernière mise à jour: {new Date().toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-slate-500 dark:text-slate-400"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
              <Button onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
          <div className="p-6 space-y-6">
            <KPICards veilleItems={veilleItems} />
            
            <FilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedSentiment={selectedSentiment}
              setSelectedSentiment={setSelectedSentiment}
              selectedDateRange={selectedDateRange}
              setSelectedDateRange={setSelectedDateRange}
              customStartDate={customStartDate}
              setCustomStartDate={setCustomStartDate}
              customEndDate={customEndDate}
              setCustomEndDate={setCustomEndDate}
            />
            
            <ChartsSection veilleItems={veilleItems} />
            
            <VeilleTable veilleItems={filteredVeille} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
