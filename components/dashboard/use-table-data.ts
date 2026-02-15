"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

interface UseTableDataOptions {
  table: string;
  select?: string;
  filterByTeacher?: boolean;
  orderBy?: string;
}

export function useTableData<T>(options: UseTableDataOptions) {
  const {
    table,
    select = "*",
    filterByTeacher = true,
    orderBy = "created_at",
  } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [table]);

  async function fetchData() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    let query = supabase.from(table).select(select);

    if (filterByTeacher) {
      query = query.eq("teacher_id", user.id);
    }

    const { data: result, error } = await query.order(orderBy, {
      ascending: false,
    });

    if (!error && result) {
      setData(result);
    }
    setLoading(false);
  }

  async function deleteItem(id: string) {
    const supabase = createClient();
    await supabase.from(table).delete().eq("id", id);
    setData(data.filter((item: any) => item.id !== id));
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

  return { data, loading, deleteItem, updateItem, refetch: fetchData };
}
