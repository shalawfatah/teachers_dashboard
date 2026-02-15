"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useMemo } from "react";

interface UseTableDataOptions {
  table: string;
  select?: string;
  filterByTeacher?: boolean;
  orderBy?: string;
  itemsPerPage?: number;
  searchFields?: string[];
}

export function useTableData<T extends Record<string, any>>(options: UseTableDataOptions) {
  const { 
    table, 
    select = "*", 
    filterByTeacher = true, 
    orderBy = "created_at",
    itemsPerPage = 10,
    searchFields = []
  } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [table]);

  async function fetchData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    let query = supabase.from(table).select(select);
    
    if (filterByTeacher) {
      query = query.eq("teacher_id", user.id);
    }
    
    const { data: result, error } = await query.order(orderBy, { ascending: false });

    if (!error && result) {
      setData(result);
    }
    setLoading(false);
  }

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    
    return data.filter(item => {
      return searchFields.some(field => {
        const value = field.includes(".") 
          ? field.split(".").reduce((obj, key) => obj?.[key], item)
          : item[field];
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, searchFields]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  async function deleteItem(id: string) {
    const supabase = createClient();
    await supabase.from(table).delete().eq("id", id);
    setData(data.filter((item: any) => item.id !== id));
  }

  async function updateItem(id: string, updates: Partial<T>) {
    const supabase = createClient();
    await supabase.from(table).update(updates).eq("id", id);
    setData(data.map((item: any) => 
      item.id === id ? { ...item, ...updates } : item
    ));
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
    totalItems: filteredData.length
  };
}
