import React from 'react';
import { Route } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import MetamaskComponent from '../Common/MetamaskComponent';
import ScheduleWizard from './ScheduleWizard';


@inject('web3Service')
@observer
export class ScheduleRoute extends MetamaskComponent {
  render() {
    return (
      <div className="container padding-25 sm-padding-10">
        <h1 className="view-title">Schedule Transaction</h1>
        <Route render={routeProps => <ScheduleWizard {...Object.assign({ isWeb3Usable: this.isWeb3Usable }, routeProps)} />} />
      </div>
    );
  }
}
