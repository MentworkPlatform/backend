export interface PostgresError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
  table?: string;
  column?: string;
}