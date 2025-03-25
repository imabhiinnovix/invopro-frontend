import { legacy_createStore as createStore, StoreEnhancer } from "redux";
import rootReducer from "./reducers";

interface WindowWithReduxDevTools extends Window {
  __REDUX_DEVTOOLS_EXTENSION__?: () => StoreEnhancer | undefined;
}

const store = createStore(
  rootReducer,
  undefined,
  (window as WindowWithReduxDevTools).__REDUX_DEVTOOLS_EXTENSION__
    ? (window as WindowWithReduxDevTools).__REDUX_DEVTOOLS_EXTENSION__!()
    : (f) => f
);

export type AppDispatch = typeof store.dispatch;
export default store;
