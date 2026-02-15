"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

interface UseTableDataOptions {
  table: string;
  select?: string;
  filterByTeacher?: boolean;
  orderBy?: string;
  pageSize?: number;
}

export function useTableData<T>(options: UseTableDataOptions) {
  const {
    table,
    select = "*",
    filterByTeacher = true,
    orderBy = "created_at",
    pageSize = 10,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, [table, currentPage, searchQuery]);

  async function fetchData() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    let query = supabase.from(table).select(select, { count: "exact" });

    if (filterByTeacher) {
      query = query.eq("teacher_id", user.id);
    }

    // Apply search filter if query exists
    if (searchQuery) {
      // Search across title/name fields
      query = query.or(
        `title.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`,
      );
    }

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    const {
      data: result,
      error,
      count,
    } = await query.order(orderBy, { ascending: false }).range(from, to);

    if (!error && result) {
      setData(result);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }

  async function deleteItem(id: string) {
    const supabase = createClient();
    await supabase.from(table).delete().eq("id", id);
    fetchData(); // Refetch to update count and pagination
  }

  async function updateItem(id: string, updates: Partial<T>) {
    const supabase = createClient();
    await supabase.from(table).update(updates).eq("id", id);
    setData(
      data.map((item: any) =>
        item.id === id ? { ...item, ...updates } : item,
      ),
    );
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    data,
    loading,
    deleteItem,
    updateItem,
    refetch: fetchData,
    currentPage,
    setCurrentPage,
    totalPages,
    searchQuery,
    setSearchQuery,
    totalCount,
  };
}
