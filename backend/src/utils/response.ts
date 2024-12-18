interface ApiResponse {
  code: 0 | 1;
  data?: any;
  error?: string;
  message?: string;
}

export const successResponse = (data: any, message?: string): ApiResponse => ({
  code: 1,
  data,
  message
});

export const errorResponse = (error: string): ApiResponse => ({
  code: 0,
  error
});

export const messageResponse = (message: string): ApiResponse => ({
  code: 1,
  message
}); 