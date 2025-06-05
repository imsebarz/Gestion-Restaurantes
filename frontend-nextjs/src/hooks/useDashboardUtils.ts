import type { ApolloError } from '@apollo/client';
import { RoleEnum } from '../types';

// Error types
interface GraphQLError {
  message: string;
}

interface NetworkError {
  message: string;
}

interface ErrorWithDetails {
  networkError?: NetworkError;
  graphQLErrors?: GraphQLError[];
  message?: string;
}

export const useDashboardUtils = (userData: any) => {
  // Helper function to get detailed error message
  const getErrorMessage = (error: ErrorWithDetails | ApolloError) => {
    if (error?.networkError) {
      if (error.networkError.message.includes('Failed to fetch')) {
        return 'No se puede conectar al servidor backend. Asegúrate de que el backend esté ejecutándose en http://localhost:4000/graphql';
      }
      return `Error de conexión: ${error.networkError.message}`;
    }
    if (error?.graphQLErrors?.length && error.graphQLErrors.length > 0) {
      return error.graphQLErrors.map((err: GraphQLError) => err.message).join(', ');
    }
    return error?.message || 'Error desconocido';
  };

  // Check if we have connection issues
  const hasConnectionIssues = (menuError?: ApolloError, tablesError?: ApolloError, ordersError?: ApolloError) => {
    return (menuError?.networkError || tablesError?.networkError || ordersError?.networkError) && 
      [menuError, tablesError, ordersError].some(error => 
        error?.networkError?.message?.includes('Failed to fetch')
      );
  };

  // QR Code URL generator
  const getQrCodeUrl = (qrCode: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/menu/${qrCode}`;
  };

  // Price formatter
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Permission checkers
  const canManageMenu = userData?.me.role === RoleEnum.MANAGER || userData?.me.role === RoleEnum.SUPERADMIN;
  const canManageTables = userData?.me.role !== undefined;

  return {
    getErrorMessage,
    hasConnectionIssues,
    getQrCodeUrl,
    formatPrice,
    canManageMenu,
    canManageTables
  };
};