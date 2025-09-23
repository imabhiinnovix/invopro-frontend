// import { useCallback, useRef } from "react";
// import { useInfiniteQuery } from "@tanstack/react-query";
// import axiosInstance from "../services/axiosInstance";
// import { AxiosError, isAxiosError } from "axios";

// type HttpMethods = "get" | "post" | "put" | "delete" | "patch";
// type onSuccess<TResponse> = (data: TResponse) => void;
// type onError<TResponse> = (
//   error: AxiosError<{ success: boolean; message?: string }> | TResponse
// ) => void;

// export interface PaginatedResponse<TResponse> {
//   data: TResponse[];
//   success: boolean;
//   message: string;
//   totalCount: number;
// }

// export const fetchItems = async <TRequest, TResponse>(
//   url: string,
//   limit: number,
//   pageParam: number = 1,
//   fetchType: HttpMethods = "get",
//   body?: TRequest
// ): Promise<PaginatedResponse<TResponse>> => {
//   const params = {
//     paginate: true,
//     page: pageParam,
//     limit,
//   };

//   const extendedBody = {
//     ...body,
//     ...params,
//   };

//   const { data } = await axiosInstance<PaginatedResponse<TResponse>>({
//     method: fetchType,
//     url,
//     params: fetchType === "get" ? params : undefined,
//     data: fetchType === "post" ? extendedBody : undefined,
//   });
//   return data;
// };

// export const useInfiniteScroll = <TRequest, TResponse>(
//   queryKey: string[],
//   url: string,
//   limit: number = 10,
//   fetchType: HttpMethods = "get",
//   enabled: boolean,
//   onSuccess?: onSuccess<PaginatedResponse<TResponse>>,
//   onError?: onError<PaginatedResponse<TResponse>>,
//   body?: TRequest
// ) => {
//   const observer = useRef<IntersectionObserver>();

//   const infiniteQuery = useInfiniteQuery({
//     queryKey: queryKey,
//     queryFn: async ({ pageParam = 1 }) => {
//       try {
//         const result = await fetchItems<TRequest, TResponse>(
//           url,
//           limit,
//           pageParam,
//           fetchType,
//           body
//         );
//         if (result?.success) {
//           if (onSuccess) onSuccess(result);
//         } else {
//           if (onError) onError(result);
//         }
//         return result;
//       } catch (error) {
//         if (error instanceof Error && isAxiosError(error) && error.response) {
//           if (onError) onError(error);
//           console.error("Error in queryFn:", error.message);
//         }
//       }
//     },
//     initialPageParam: 1,
//     getNextPageParam: (lastPage, allPages) => {
//         if (!lastPage || !lastPage.success) return undefined;

//       const totalPages = Math.ceil((lastPage?.totalCount || 0) / limit);
//       return allPages?.length < totalPages ? allPages?.length + 1 : undefined;
//     },
//     enabled: enabled,
//   });

//   const { fetchNextPage, hasNextPage, isFetchingNextPage } = infiniteQuery;

//   const lastElementRef: React.RefCallback<HTMLElement> = useCallback(
//     (node: HTMLElement) => {
//       if (observer.current) observer.current.disconnect();
//       observer.current = new IntersectionObserver((entries) => {
//         if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
//           fetchNextPage();
//         }
//       });

//       if (node) observer.current.observe(node);
//     },
//     [fetchNextPage, hasNextPage, isFetchingNextPage]
//   );

//   return { infiniteQuery, lastElementRef };
// };


import { useCallback, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "../services/axiosInstance";
import { AxiosError, isAxiosError } from "axios";

type HttpMethods = "get" | "post" | "put" | "delete" | "patch";
type onSuccess<TResponse> = (data: TResponse) => void;
type onError<TResponse> = (
  error: AxiosError<{ success: boolean; message?: string }> | TResponse
) => void;

export interface PaginatedResponse<TResponse> {
  data: TResponse[];
  success: boolean;
  message: string;
  totalCount: number;
}

export const fetchItems = async <TRequest, TResponse>(
  url: string,
  limit: number,
  pageParam: number = 1,
  fetchType: HttpMethods = "get",
  body?: TRequest
): Promise<PaginatedResponse<TResponse>> => {
  const params = {
    paginate: true,
    page: pageParam,
    limit,
  };

  const extendedBody = {
    ...body,
    ...params,
  };

  const { data } = await axiosInstance<PaginatedResponse<TResponse>>({
    method: fetchType,
    url,
    params: fetchType === "get" ? params : undefined,
    data: fetchType === "post" ? extendedBody : undefined,
  });
  return data;
};

export const useInfiniteScroll = <TRequest, TResponse>(
  queryKey: string[],
  url: string,
  limit: number = 10,
  fetchType: HttpMethods = "get",
  enabled: boolean,
  onSuccess?: onSuccess<PaginatedResponse<TResponse>>,
  onError?: onError<PaginatedResponse<TResponse>>,
  body?: TRequest
) => {
  const observer = useRef<IntersectionObserver>();

  const infiniteQuery = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const result = await fetchItems<TRequest, TResponse>(
          url,
          limit,
          pageParam,
          fetchType,
          body
        );
        if (result?.success) {
          if (onSuccess) onSuccess(result);
        } else {
          if (onError) onError(result);
        }
        return result;
      } catch (error) {
        if (error instanceof Error && isAxiosError(error) && error.response) {
          if (onError) onError(error);
          console.error("Error in queryFn:", error.message);
        }
        throw error; // Re-throw to let React Query handle the error state
      }
    },
    initialPageParam: 1,
    // getNextPageParam: (lastPage, allPages) => {
    //   try {
    //     // Add comprehensive null/undefined checks
    //     if (!lastPage || !lastPage.success || !allPages || !Array.isArray(allPages)) {
    //       return undefined;
    //     }

    //     const totalCount = lastPage.totalCount || 0;
    //     const totalPages = Math.ceil(totalCount / limit);
    //     const currentPageCount = allPages.length;
        
    //     // Ensure we don't go beyond available pages
    //     return currentPageCount < totalPages ? currentPageCount + 1 : undefined;
    //   } catch (error) {
    //     console.error("Error in getNextPageParam:", error);
    //     return undefined;
    //   }
    // },
    getNextPageParam: (lastPage, allPages) => {
  try {
    if (!lastPage || !lastPage.success || !Array.isArray(allPages)) {
      return undefined;
    }

    const totalCount = lastPage.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const currentPageCount = allPages?.length ?? 0;

    return currentPageCount < totalPages ? currentPageCount + 1 : undefined;
  } catch (error) {
    console.error("Error in getNextPageParam:", error);
    return undefined;
  }
},

    enabled: enabled,
    // Add retry configuration to handle temporary failures
    retry: (failureCount, error) => {
      if (failureCount < 3) {
        return true;
      }
      return false;
    },
    // Add stale time to prevent unnecessary refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = infiniteQuery;

  const lastElementRef: React.RefCallback<HTMLElement> = useCallback(
    (node: HTMLElement | null) => {
      if (observer.current) observer.current.disconnect();
      
      if (!node) return;
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage().catch((error) => {
            console.error("Error fetching next page:", error);
          });
        }
      });

      observer.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  return { infiniteQuery, lastElementRef };
};