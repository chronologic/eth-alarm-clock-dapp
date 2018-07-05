import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SidePanel from '../SidePanel/SidePanel';
import SearchOverlay from '../Search/SearchOverlay';
import Header from '../Header/Header';
import CustomProviderModal from '../Modals/CustomProviderModal';
import { Route, Switch, withRouter } from 'react-router-dom';
import AwaitingMining from '../Common/AwaitingMining';
import Faucet from '../Common/Faucet';
import TransactionsRoute from '../TransactionsRoute/TransactionsRoute';
import TimeNodeRoute from '../TimeNode/TimeNodeRoute';
import { ScheduleRoute } from '../ScheduleWizard/ScheduleRoute';
import URLNotFound from '../Common/URLNotFound';
import { inject } from 'mobx-react';

@withRouter
@inject('web3Service')
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSearchOverlay: false
    };
    this.updateSearchState = this.updateSearchState.bind(this);
    this.onEscKey = this.onEscKey.bind(this);
    this.getCurrentBlock = this.getCurrentBlock.bind(this);
  }

  /*
    A function that enables or disables the overlay
    of the Search function.
  */
  updateSearchState(enabled) {
    this.setState({ showSearchOverlay: enabled });
  }

  /*
    Esc keypress listener. Used for:
    - Detecting when to close the search overlay
  */
  onEscKey(event) {
    if (event.keyCode === 27 && this.state.showSearchOverlay) {
      this.updateSearchState(false);
    }
  }

  async componentDidMount() {
    document.addEventListener('keydown', this.onEscKey, false);

    await this.getCurrentBlock();
    // Check every 10 seconds if the block number changed
    this.interval = setInterval(await this.getCurrentBlock, 10000);
  }

  async getCurrentBlock() {
    const { web3Service } = this.props;
    await web3Service.fetchBlockNumber();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div className="app-container">
        <SidePanel {...this.props} />
        <div className="page-container">
          <Header updateSearchState={this.updateSearchState} history={this.props.history} />
          <div className="page-content-wrapper">
            <div className="content sm-gutter">
              <Switch>
                <Route exact path="/" component={ScheduleRoute} />
                <Route path="/awaiting/:type/:hash" component={AwaitingMining} />
                <Route path="/transactions" component={TransactionsRoute} />
                <Route path="/timenode" component={TimeNodeRoute} />
                <Route path="/faucet" component={Faucet} />
                <Route component={URLNotFound} />
              </Switch>
            </div>
          </div>
        </div>

        {this.state.showSearchOverlay && (
          <SearchOverlay updateSearchState={this.updateSearchState} history={this.props.history} />
        )}
        <CustomProviderModal />
      </div>
    );
  }
}

App.propTypes = {
  web3Service: PropTypes.any,
  history: PropTypes.object.isRequired
};

export default App;
