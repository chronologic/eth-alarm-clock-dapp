/* eslint-disable react/require-render-return */
import React from 'react';
import { action } from 'mobx';

import { NAVIGATION_STEPS, PROPERTIES as ALL_PROPERTIES } from '../lib/consts';
import InputField from './InputField';

export default class AbstractWizard extends React.Component {
constructor(activeStepKey, activeApp, props) {
  super(props);

  this.activeStepKey = activeStepKey;
  this.activeApp = activeApp;

  this.activeStep = NAVIGATION_STEPS[this.activeApp][this.activeStepKey];
  if(!this.activeStep){
    throw new Error('No steps with key', this.activeStepKey);
  }
  if (!this.activeStep.propertyKeys){
    throw new Error('No propertyKeys for step', this.activeStep);
  }
  this.properties = ALL_PROPERTIES.reduce((result, value) => (
    this.activeStep.propertyKeys.includes(value.name) ?
    { ...result, [value.name]: value } :
    result
  ), {});
}
}
