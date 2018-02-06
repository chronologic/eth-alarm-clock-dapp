import React, { Component } from 'react';
import PropTypes from 'prop-types';

class SearchOverlay extends Component {
  render() {
    return (
      <div id="searchOverlay" className="overlay" data-pages="search">
        <div className="overlay-content has-results m-t-20">
          <div className="container-fluid">
            <img className="overlay-brand" src="img/logo-black.png" alt="logo" data-src="img/logo-black.png" height="36" />
            <a href="#" className="close-icon-light overlay-close text-black fs-16" onClick={() => {this.props.updateSearchState(false)}}>
              <i className="pg-close"></i>
            </a>
          </div>
          <div className="container-fluid">
            <input id="overlay-search" className="no-border overlay-search bg-transparent" placeholder="Search..." autoComplete="off" spellCheck="false"/>
            <br/>
            <div className="inline-block">
              <div className="checkbox right">
                <input id="checkboxn" type="checkbox" value="1" defaultChecked="checked"/>
                <label htmlFor="checkboxn"><i className="fa fa-search"></i> Search within page</label>
              </div>
            </div>
            <div className="inline-block m-l-10">
              <p className="fs-13">Press enter to search</p>
            </div>
          </div>
          <div className="container-fluid">
            <div className="search-results m-t-40">
              <p className="bold">ETH Alarm Clock Search Results</p>
              <div className="row">
                <div className="col-md-12">
                  <div>
                    <div className="thumbnail-wrapper d48 circular bg-primary text-black inline m-t-10">
                      <div>E</div>
                    </div>
                    <div className="p-l-10 inline p-t-5">
                      <h5 className="m-b-5">Transaction <span className="semi-bold result-name">0xasudbasidubasfafasd6s4d6asd45asd</span></h5>
                      <p className="hint-text">Executed</p>
                    </div>
                  </div>
                  <div>
                    <div className="thumbnail-wrapper d48 circular bg-primary text-black inline m-t-10">
                      <div>S</div>
                    </div>
                    <div className="p-l-10 inline p-t-5">
                      <h5 className="m-b-5">Transaction <span className="semi-bold result-name">0x68asd1a8s6d1as68d1asa4s7898123</span></h5>
                      <p className="hint-text">Scheduled</p>
                    </div>
                  </div>
                  <div>
                    <div className="thumbnail-wrapper d48 circular bg-primary text-black inline m-t-10">
                      <div>E</div>
                    </div>
                    <div className="p-l-10 inline p-t-5">
                      <h5 className="m-b-5">Transaction <span className="semi-bold result-name">0xASidnasodinOi123907adfoinoi123456</span></h5>
                      <p className="hint-text">Executed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SearchOverlay.propTypes = {
  updateSearchState: PropTypes.any
};

export default SearchOverlay;