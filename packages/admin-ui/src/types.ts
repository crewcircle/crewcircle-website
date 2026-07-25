export interface Project {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  status: "active" | "killed";
  created_at: string;
  killed_at?: string;
}

export interface ProjectWithGitHub extends Project {
  stars?: number;
  forks?: number;
  open_issues?: number;
  default_branch?: string;
  last_push?: string;
  language?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}
