import { DataSourceListData } from "../../components/atom/sideNav/types";

export const SET_DATA_SOURCE_LIST = "SET_DATA_SOURCE_LIST" as const;

export const setDataSourceList = (
  data: (DataSourceListData | undefined)[]
) => ({
  type: SET_DATA_SOURCE_LIST,
  payload: data,
});
