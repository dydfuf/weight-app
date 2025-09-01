"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, MessageSquare, RefreshCw, Scale } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";

interface WeightEntry {
  id: string;
  recorded_at: string;
  weight_kg: number;
  note: string | null;
  created_at: string;
}

interface OptimisticWeightEntry {
  weight_kg: number;
  recorded_at: string;
  note?: string;
}

interface RecentWeightEntriesProps {
  optimisticEntry?: OptimisticWeightEntry | null;
  refreshTrigger?: number;
}

export function RecentWeightEntries({ optimisticEntry, refreshTrigger }: RecentWeightEntriesProps) {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchRecentEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("weights")
        .select("id, recorded_at, weight_kg, note, created_at")
        .order("recorded_at", { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      // 낙관적 업데이트 데이터가 있으면 우선 사용
      const finalEntries = data || [];
      if (optimisticEntry) {
        // 오늘 날짜의 기존 데이터가 있는지 확인
        const todayIndex = finalEntries.findIndex(
          (entry) => entry.recorded_at === optimisticEntry.recorded_at,
        );
        if (todayIndex >= 0) {
          // 기존 데이터 업데이트
          finalEntries[todayIndex] = {
            ...finalEntries[todayIndex],
            weight_kg: optimisticEntry.weight_kg,
            note: optimisticEntry.note || finalEntries[todayIndex].note,
          };
        } else {
          // 새 데이터 추가 (목록 맨 앞에)
          finalEntries.unshift({
            id: "optimistic",
            weight_kg: optimisticEntry.weight_kg,
            recorded_at: optimisticEntry.recorded_at,
            note: optimisticEntry.note || null,
            created_at: new Date().toISOString(),
          });
        }
      }

      setEntries(finalEntries);
    } catch (err) {
      console.error("최근 체중 기록 로드 실패:", err);
      setError("데이터를 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, [supabase, optimisticEntry]);

  useEffect(() => {
    fetchRecentEntries();
  }, [fetchRecentEntries]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "오늘";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "어제";
    } else {
      return format(date, "MM.dd (E)", { locale: ko });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            최근 체중 기록
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-3 w-[60px]" />
                </div>
              </div>
              <Skeleton className="h-6 w-[50px]" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            최근 체중 기록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchRecentEntries} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          최근 체중 기록
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">아직 체중 기록이 없습니다</p>
            <p className="text-sm text-muted-foreground">오늘의 체중을 기록해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <Scale className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{entry.weight_kg.toFixed(1)} kg</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(entry.recorded_at)}
                      {entry.note && (
                        <>
                          <span>•</span>
                          <MessageSquare className="h-3 w-3" />
                          <span className="truncate max-w-[100px]">{entry.note}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {format(new Date(entry.created_at), "HH:mm")}
                </Badge>
              </div>
            ))}

            {entries.length >= 10 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" onClick={fetchRecentEntries} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  새로고침
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
