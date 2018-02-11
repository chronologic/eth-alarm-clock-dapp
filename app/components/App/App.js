import React, { Component } from 'react'
import SidePanel from '../SidePanel/SidePanel';
import SearchOverlay from '../Search/SearchOverlay';
import Header from '../Header/Header';
import { Route } from 'react-router-dom';
import { default as AwaitingMining } from '../Common/AwaitingMining';
import { default as TransactionsRoute } from '../TransactionsRoute/TransactionsRoute';
import { ScheduleRoute } from '../ScheduleWizard/ScheduleRoute';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showSearchOverlay: false
    };
    this.updateSearchState = this.updateSearchState.bind(this);
    this.onEscKey = this.onEscKey.bind(this);
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
  onEscKey(event){
    if(event.keyCode === 27) {
      if(this.state.showSearchOverlay) {
        this.updateSearchState(false);
      }
    }
  }

  componentDidMount(){
    document.addEventListener("keydown", this.onEscKey, false);
  }

  render() {
    let searchOverlayPlaceholder = null;
    if (this.state.showSearchOverlay) {
      searchOverlayPlaceholder = <SearchOverlay updateSearchState={this.updateSearchState}/>;
    }

    return (
      <div>
        <SidePanel />
        <div className="page-container">
          <Header updateSearchState={this.updateSearchState}/>
          <div className="page-content-wrapper">
            <div className="content sm-gutter">
              <Route exact path="/" component={ScheduleRoute}/>
              <Route path="/awaiting" component={AwaitingMining}/>
              <Route path="/transactions" component={TransactionsRoute}/>
            </div>
          </div>
        </div>
        {searchOverlayPlaceholder}
      </div>
    );
  }
}

export default App
