import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCw, Database, Cloud, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupabaseStatus {
  connected: boolean;
  count: number;
}

interface SyncResult {
  success: boolean;
  message: string;
  count?: number;
}

export default function SyncPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: databaseStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<SupabaseStatus>({
    queryKey: ['/api/database/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: localData } = useQuery<any[]>({
    queryKey: ['/api/veille'],
  });

  const dataCount = Array.isArray(localData) ? localData.length : 0;
  const databaseCount = databaseStatus?.count || 0;
  const isConnected = databaseStatus?.connected || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          État de la Base de Données
        </CardTitle>
        <CardDescription>
          Informations sur la connexion et les données Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">État de la connexion:</span>
            {statusLoading ? (
              <Badge variant="secondary">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Vérification...
              </Badge>
            ) : isConnected ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connecté
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Déconnecté
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchStatus()}
            disabled={statusLoading}
          >
            <RefreshCw className={`h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Separator />

        {/* Data Count */}
        <div className="text-center p-4 border rounded-lg">
          <Database className="h-12 w-12 mx-auto mb-3 text-blue-500" />
          <div className="text-3xl font-bold">{databaseCount}</div>
          <div className="text-sm text-muted-foreground">Articles de veille</div>
        </div>

        <Separator />

        {/* Database Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Type de base:</span>
            <span className="font-medium">Supabase PostgreSQL</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Dernière vérification:</span>
            <span className="font-medium">{new Date().toLocaleTimeString("fr-FR")}</span>
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          onClick={() => refetchStatus()}
          disabled={statusLoading}
          variant="outline"
          className="w-full"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${statusLoading ? 'animate-spin' : ''}`} />
          Actualiser les données
        </Button>
        
        {!isConnected && (
          <div className="text-sm text-muted-foreground text-center p-3 bg-red-50 border border-red-200 rounded-lg">
            Vérifiez votre configuration Supabase pour activer la base de données
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Connexion directe à Supabase</div>
          <div>• Mise à jour automatique toutes les 30 secondes</div>
          <div>• Données persistantes dans le cloud</div>
        </div>
      </CardContent>
    </Card>
  );
}