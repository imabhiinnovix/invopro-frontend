import { DataSourceListData } from "../../components/atom/sideNav/types";

interface SetDataSourceListAction {
  type: typeof SET_DATA_SOURCE_LIST;
  payload: (DataSourceListData | undefined)[];
}

const initialState = {
  list: [],
};

export const SET_DATA_SOURCE_LIST = "SET_DATA_SOURCE_LIST";

const dataSourceReducer = (
  state = initialState,
  action: SetDataSourceListAction
) => {
  switch (action.type) {
    case SET_DATA_SOURCE_LIST:
      return { ...state, list: action.payload };
    default:
      return state;
  }
};

export default dataSourceReducer;
