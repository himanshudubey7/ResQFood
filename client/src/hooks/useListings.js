import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsAPI } from '../services/api';
import toast from 'react-hot-toast';

export function useListings(params = {}) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: () => listingsAPI.getAll(params),
    staleTime: 30000,
  });
}

export function useListing(id) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsAPI.getById(id),
    enabled: !!id,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => listingsAPI.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Listing created successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create listing');
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => listingsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Listing updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update listing');
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => listingsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Listing deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete listing');
    },
  });
}

export function useClaimListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => listingsAPI.claim(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast.success('Listing claimed successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to claim listing');
    },
  });
}
