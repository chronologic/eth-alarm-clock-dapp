import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import Scrollbar from 'smooth-scrollbar';
import TimeSettings from '../ScheduleWizard/TimeSettings';
import InfoSettings from '../ScheduleWizard/InfoSettings';
import BountySettings from '../ScheduleWizard/BountySettings';
import ConfirmSettings from '../ScheduleWizard/ConfirmSettings';

class ScheduleWizard extends Component {
  constructor(props){
    super(props);
    this.state = {};
    this.initiateScrollbar = this.initiateScrollbar.bind(this);
    this.goToWait = this.goToWait.bind(this);
  }

  goToWait(){
  }

  componentDidMount() {
    const { jQuery } = window;

    jQuery('#scheduleWizard').bootstrapWizard({
      onTabShow: function (tab, navigation, index) {
        var $total = navigation.find('li').length;
        var $current = index + 1;

        // If it's the last tab then hide the last button and show the finish instead
        if ($current >= $total) {
          jQuery('#scheduleWizard').find('.pager .next').hide();
          jQuery('#scheduleWizard').find('.pager .finish').show();
          jQuery('#scheduleWizard').find('.pager .finish').removeClass('disabled');
        } else {
          jQuery('#scheduleWizard').find('.pager .next').show();
          jQuery('#scheduleWizard').find('.pager .finish').hide();
        }
      }
    });
    this.initiateScrollbar();
  }

  initiateScrollbar(){
    const options = {};
    const element = document.querySelector('.tab-pane.active');
    if(element){
      Scrollbar.init(element, options)
    }
   }

render() {

  return (
    <div id="scheduleWizard">
      <ul className="nav nav-tabs nav-tabs-linetriangle nav-tabs-separator">
        <li>
          <a data-toggle="tab" href="#tab1"  onClick={ this.initiateScrollbar }><i className="far fa-clock tab-icon fa-2x"></i> <span>Date & Time</span></a>
        </li>
        <li>
          <a data-toggle="tab" href="#tab2"  onClick={ this.initiateScrollbar }><i className="fas fa-info fa-2x tab-icon"></i> <span>Information</span></a>
        </li>
        <li>
          <a data-toggle="tab" href="#tab3"  onClick={ this.initiateScrollbar }><i className="fab fa-ethereum fa-2x tab-icon"></i> <span>Bounty</span></a>
        </li>
        <li>
          <a data-toggle="tab" href="#tab4"  onClick={ this.initiateScrollbar }><i className="fas fa-cloud-upload-alt fa-2x tab-icon"></i> <span>Confirm</span></a>
        </li>
      </ul>

      <div className="tab-content">
        <div className="tab-pane active slide" id="tab1">
          <TimeSettings/>
        </div>
        <div className="tab-pane slide" id="tab2">
          <InfoSettings/>
        </div>
        <div className="tab-pane slide" id="tab3">
          <BountySettings/>
        </div>
        <div className="tab-pane slide" id="tab4">
          <ConfirmSettings
          />
        </div>

        <div className="footer-buttons">
          <ul className="pager wizard no-style">
            <li className="next">
              <button className="btn btn-primary btn-cons pull-right" onClick={ this.initiateScrollbar } type="button">
                <span>Next</span>
              </button>
            </li>
            <li className="next finish" style={{ display: 'none' }}>
              <NavLink to="/awaiting" className="btn btn-primary btn-cons pull-right" type="button">
                <span>Schedule</span>
              </NavLink>
            </li>
            <li className="previous first" style={{ display: 'none' }}>
                  <button className="btn btn-white btn-cons pull-right" onClick={ this.initiateScrollbar } type="button">
                      <span>First</span>
                  </button>
              </li>
            <li className="previous">
              <button className="btn btn-white btn-cons pull-right" onClick={ this.initiateScrollbar } type="button">
                <span>Previous</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
}

export default ScheduleWizard;
