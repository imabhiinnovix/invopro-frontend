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
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil((lastPage?.totalCount || 0) / limit);
      return allPages?.length < totalPages ? allPages?.length + 1 : undefined;
    },
    enabled: enabled,
  });

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = infiniteQuery;

  const lastElementRef: React.RefCallback<HTMLElement> = useCallback(
    (node: HTMLElement) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  return { infiniteQuery, lastElementRef };
};
