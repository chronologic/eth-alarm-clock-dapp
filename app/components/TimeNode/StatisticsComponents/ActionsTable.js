import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';

const PAGE_SIZE = 100;

@inject('timeNodeStore')
@observer
class ActionsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1
    };
    this.changePage = this.changePage.bind(this);
  }

  changePage(page) {
    this.setState({
      currentPage: page
    });
  }

  render() {
    const {
      successfulClaims,
      failedClaims,
      successfulExecutions,
      failedExecutions
    } = this.props.timeNodeStore;

    const { currentPage } = this.state;

    const concatActions = actionArrays => {
      let concatedActions = [];
      actionArrays.forEach(actions => {
        if (actions !== null) {
          actions.forEach(action => concatedActions.push(action));
        }
      });
      return concatedActions.sort((a, b) => b.timestamp - a.timestamp);
    };

    const allActions = concatActions([
      successfulClaims,
      failedClaims,
      successfulExecutions,
      failedExecutions
    ]);

    const pagination = { from: (currentPage - 1) * PAGE_SIZE, to: currentPage * PAGE_SIZE };

    const filteredActions = allActions.slice(pagination.from, pagination.to);
    const numPages = allActions.length > 0 ? Math.ceil(allActions.length / PAGE_SIZE) : 0;

    return (
      <div id="actionsTable">
        <div className="font-montserrat m-r-25 m-b-10" style={{ textAlign: 'right' }}>
          Showing actions: {pagination.from}-
          {pagination.to > allActions.length ? allActions.length : pagination.to}/
          {allActions.length}
        </div>
        <div className="auto-overflow" style={{ height: '250px' }}>
          <table className="table table-condensed header-fixed">
            <thead>
              <tr>
                <th className="font-montserrat">Time</th>
                <th className="font-montserrat">Action</th>
                <th className="font-montserrat">Transaction</th>
                <th className="font-montserrat">Bounty</th>
                <th className="font-montserrat">Cost</th>
                <th className="font-montserrat">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {filteredActions.map((action, i) => {
                switch (action.action) {
                  case 1:
                    action.action = 'Claim';
                    break;
                  case 2:
                    action.action = 'Execute';
                }

                switch (action.result) {
                  case 0:
                    action.result = 'Failed';
                    break;
                  case 1:
                    action.result = 'Success';
                }

                return (
                  <tr key={i}>
                    <td>{moment(action.timestamp).format('DD/MM/YYYY HH:mm:ss')}</td>
                    <td className="font-montserrat all-caps">{action.action}</td>
                    <td className="hint-text small">
                      <Link to={`/transactions/${action.txAddress}`}>{action.txAddress}</Link>
                    </td>
                    <td className="">{action.bounty} wei</td>
                    <td className="">{action.cost} wei</td>
                    <td className="font-montserrat all-caps b-l b-dashed b-grey">
                      {action.result}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {Array.from(Array(numPages).keys()).map(i => {
          const page = i + 1;
          return (
            <span key={i} className="px-3" onClick={() => this.changePage(page)}>
              {page}
            </span>
          );
        })}
      </div>
    );
  }
}

ActionsTable.propTypes = {
  timeNodeStore: PropTypes.any
};

export { ActionsTable };
