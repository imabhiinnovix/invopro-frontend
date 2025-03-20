import { combineReducers } from "redux";
import dataSourceReducer from "../pages/dataSources/dataSourceReducer";

// 👇 Explicitly define the shape of your Redux state
const rootReducer = combineReducers({
  dataSource: dataSourceReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
