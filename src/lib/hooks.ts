import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, queryKeys } from '@/lib/apiClient';

// ============================================
// COMMUNITY POSTS HOOKS
// ============================================

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  imageUrl?: string;
  placeName?: string;
  likes: number;
  comments: number;
  isFeatured: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostFilters {
  search?: string;
  isFeatured?: boolean;
  limit?: number;
  offset?: number;
}

export function useCommunityPosts(filters: PostFilters = {}) {
  return useQuery({
    queryKey: queryKeys.posts.list(filters),
    queryFn: () => apiClient.get<{ data: Post[]; pagination: any }>('/posts', filters),
    select: (response) => response?.data || [],
  });
}

export function useFeaturedPosts() {
  return useQuery({
    queryKey: queryKeys.posts.featured(),
    queryFn: () => apiClient.get<Post[]>('/posts/featured'),
    select: (response) => response?.data || [],
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(id),
    queryFn: () => apiClient.get<Post>(`/posts/${id}`),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Post>) => 
      apiClient.post<Post>('/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Post> }) =>
      apiClient.put<Post>(`/posts/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.post<void>(`/posts/${id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

// ============================================
// DICHOS HOOKS
// ============================================

export interface Dichos {
  id: string;
  personaje: string;
  texto: string;
  significado: string;
  jergaOriginal: string;
  categoria: string;
  likes: number;
  createdAt: string;
}

export interface DichosFilters {
  categoria?: string;
  search?: string;
  personaje?: string;
  limit?: number;
  offset?: number;
}

export function useDichos(filters: DichosFilters = {}) {
  return useQuery({
    queryKey: queryKeys.dichos.list(filters),
    queryFn: () => apiClient.get<{ data: Dichos[]; pagination: any }>('/dichos', filters),
    select: (response) => response?.data || [],
  });
}

export function useDichosById(id: string) {
  return useQuery({
    queryKey: queryKeys.dichos.detail(id),
    queryFn: () => apiClient.get<Dichos>(`/dichos/${id}`),
    enabled: !!id,
  });
}

export function useCreateDichos() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Dichos>) => 
      apiClient.post<Dichos>('/dichos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dichos.all });
    },
  });
}

export function useLikeDichos() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.post<void>(`/dichos/${id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dichos.all });
    },
  });
}

// ============================================
// NEWSLETTER HOOKS
// ============================================

export function useNewsletterSubscribe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (email: string) => 
      apiClient.post<{ success: boolean; message: string }>('/newsletter/subscribe', { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.newsletter.subscribers() });
    },
  });
}

export function useNewsletterUnsubscribe() {
  return useMutation({
    mutationFn: (email: string) => 
      apiClient.post<{ success: boolean; message: string }>('/newsletter/unsubscribe', { email }),
  });
}

// ============================================
// PAYMENTS HOOKS
// ============================================

export interface DonationSession {
  sessionId: string;
  url: string;
}

export interface BusinessUpgradeSession {
  sessionId: string;
  url: string;
}

export function useDonationCheckout() {
  return useMutation({
    mutationFn: (data: { amount: number; isMonthly: boolean; message?: string }) =>
      apiClient.post<DonationSession>('/payments/donations/checkout', data),
  });
}

export function useBusinessPremiumCheckout() {
  return useMutation({
    mutationFn: ({ businessId, plan }: { businessId: string; plan: 'monthly' | 'yearly' }) =>
      apiClient.post<BusinessUpgradeSession>(`/payments/businesses/${businessId}/checkout`, { plan }),
  });
}

// ============================================
// ADMIN HOOKS
// ============================================

export interface AdminStats {
  totalBusinesses: number;
  activeBusinesses: number;
  pendingBusinesses: number;
  premiumBusinesses: number;
  totalUsers: number;
  totalPosts: number;
  totalEvents: number;
}

export interface AdminFilters {
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
  limit?: number;
  offset?: number;
}

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => apiClient.get<AdminStats>('/admin/stats'),
  });
}

export function useAdminBusinesses(filters: AdminFilters = {}) {
  return useQuery({
    queryKey: [...queryKeys.admin.businesses(), filters],
    queryFn: () => apiClient.get<{ data: any[]; pagination: any }>('/admin/businesses', filters),
    select: (response) => response?.data || [],
  });
}

export function useApproveBusiness() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      apiClient.post<{ success: boolean }>(`/admin/businesses/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useRejectBusiness() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiClient.post<{ success: boolean }>(`/admin/businesses/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useFeatureBusiness() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      apiClient.post<{ success: boolean }>(`/admin/businesses/${id}/feature`, { isFeatured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
    },
  });
}

export function useModeratePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'hidden' | 'visible' | 'featured' }) =>
      apiClient.patch<{ success: boolean }>(`/admin/posts/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.posts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

// ============================================
// ADMIN BUSINESS CRUD HOOKS
// ============================================

export interface BusinessInput {
  name: string;
  category: string;
  description: string;
  shortDescription?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  addressReference?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  videoUrl?: string;
  scheduleDisplay?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  priceRange?: string;
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BusinessInput) =>
      apiClient.post<{ success: boolean; id: string }>('/admin/businesses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BusinessInput> }) =>
      apiClient.put<{ success: boolean }>(`/admin/businesses/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.business(id) });
    },
  });
}

export function useDeleteBusiness() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ success: boolean }>(`/admin/businesses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useToggleBusinessStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.patch<{ success: boolean }>(`/admin/businesses/${id}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useToggleBusinessPremium() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isPremium }: { id: string; isPremium: boolean }) =>
      apiClient.patch<{ success: boolean }>(`/admin/businesses/${id}/premium`, { isPremium }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.businesses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}
