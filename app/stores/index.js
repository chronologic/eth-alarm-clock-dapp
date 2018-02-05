import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();

export const history = syncHistoryWithStore(browserHistory, routingStore);

export const stores = {
  routing: routingStore
};