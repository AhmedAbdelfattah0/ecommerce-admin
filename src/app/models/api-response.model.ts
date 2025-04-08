/**
 * Standard API response interface
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
