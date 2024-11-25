export interface ActionResult {
  success?: boolean;
  message?: string;
  data?: unknown;
  errors?: Record<string, string[]>;
}
