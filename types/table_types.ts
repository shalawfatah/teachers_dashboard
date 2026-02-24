export interface UseTableDataOptions {
  table: string;
  select?: string;
  filterByTeacher?: boolean;
  orderBy?: string;
  itemsPerPage?: number;
  searchFields?: string[];
}
