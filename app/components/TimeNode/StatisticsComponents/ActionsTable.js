import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactPaginate from 'react-paginate';
import { Link } from 'react-router-dom';
import { isRunningInElectron } from '../../../lib/electron-util';

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
      currentPage: page.selected + 1
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

    const combineActions = actionArrays => {
      const combined = [];
      actionArrays.forEach(actions => {
        if (actions !== null) {
          actions.forEach(action => combined.push(action));
        }
      });
      return combined.sort((a, b) => b.timestamp - a.timestamp);
    };

    const allActions = combineActions([
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
        {allActions.length > 0 && (
          <div className="font-montserrat m-r-25 m-b-10 text-right">
            Showing actions: {pagination.from + 1}-
            {pagination.to > allActions.length ? allActions.length : pagination.to}/
            {allActions.length}
          </div>
        )}
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
                      {isRunningInElectron() ? (
                        <a
                          href={`https://app.chronologic.network/transactions/${action.txAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {action.txAddress}
                        </a>
                      ) : (
                        <Link to={`/transactions/${action.txAddress}`}>{action.txAddress}</Link>
                      )}
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
        <div className="row my-4">
          <div className="col-md-6">
            <div className="mx-4">
              <p className="small no-margin">
                <a href="#">
                  <i className="fa fs-16 fa-arrow-circle-o-down text-success m-r-10" />
                </a>
                <span className="hint-text ">For more details, see the LOGS tab.</span>
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="float-md-right">
              <ReactPaginate
                previousClassName={'hide'}
                nextClassName={'hide'}
                breakLabel={
                  <a href className="actions-pages">
                    ...
                  </a>
                }
                breakClassName={'btn p-0'}
                pageCount={numPages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={this.changePage}
                containerClassName={'pagination btn-group mx-4'}
                pageClassName={'btn p-0'}
                pageLinkClassName={'actions-pages'}
                activeClassName={'btn-primary'}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ActionsTable.propTypes = {
  timeNodeStore: PropTypes.any
};

export { ActionsTable };
