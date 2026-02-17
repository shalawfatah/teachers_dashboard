"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useMemo, useCallback } from "react";

interface UseTableDataOptions {
  table: string;
  select?: string;
  filterByTeacher?: boolean;
  orderBy?: string;
  itemsPerPage?: number;
  searchFields?: string[];
}

export function useTableData<T extends { id: string }>(
  options: UseTableDataOptions,
) {
  const {
    table,
    select = "*",
    filterByTeacher = true,
    orderBy = "created_at",
    itemsPerPage = 10,
    searchFields = [],
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    let query = supabase.from(table).select(select);

    if (filterByTeacher) {
      query = query.eq("teacher_id", user.id);
    }

    const { data: result, error } = await query
      .order(orderBy, { ascending: false })
      .returns<T[]>(); // ✅ moved here

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (result) {
      setData(result);
    }

    setLoading(false);
  }, [table, select, filterByTeacher, orderBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    return data.filter((item) =>
      searchFields.some((field) => {
        const value = field.includes(".")
          ? field.split(".").reduce<unknown>((obj, key) => {
            if (obj && typeof obj === "object" && key in obj) {
              return (obj as Record<string, unknown>)[key];
            }
            return undefined;
          }, item)
          : (item as Record<string, unknown>)[field];

        return String(value ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }),
    );
  }, [data, searchQuery, searchFields]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  async function deleteItem(id: string) {
    const supabase = createClient();
    await supabase.from(table).delete().eq("id", id);

    setData((prev) => prev.filter((item) => item.id !== id));
  }

  async function updateItem(id: string, updates: Partial<T>) {
    const supabase = createClient();
    await supabase.from(table).update(updates).eq("id", id);

    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  return {
    data: paginatedData,
    loading,
    deleteItem,
    updateItem,
    refetch: fetchData,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems: filteredData.length,
  };
}
