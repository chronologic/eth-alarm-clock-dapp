import { Component } from 'react';
import Scrollbar from 'smooth-scrollbar';

class ScrollbarComponent extends Component {
  constructor(props) {
    super(props);
    this.initiateScrollbar = this.initiateScrollbar.bind(this);
  }

  initiateScrollbar() {
    const options = {};
    const element = document.querySelector('.tab-pane.active');
    if (element) {
      Scrollbar.init(element, options)
    }
   }

   componentDidMount() {
     this.initiateScrollbar();
   }

}

export default ScrollbarComponent;
