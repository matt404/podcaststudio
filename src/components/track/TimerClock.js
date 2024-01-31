import './TimerClock.css';
import React, {Component} from 'react';
import PropTypes from "prop-types";

class TimerClock extends Component {
  static propTypes = {
    recording: PropTypes.bool,
  }

  constructor(props) {
    super(props);

    this.state = {
      startTime: null,
      timerClassName: 'TimerClockInactive',
    };

    this.timer = null;
  }

  componentDidUpdate(prevProps) {
    if (this.props.recording && !prevProps.recording) {
      // Recording has started
      this.setState({
        startTime: Date.now(),
        timerClassName: 'TimerClockActive'
      });
      this.timer = setInterval(() => this.forceUpdate(), 1000);
    } else if (!this.props.recording && prevProps.recording) {
      // Recording has stopped
      clearInterval(this.timer);
      this.setState({
        startTime: null,
        timerClassName: 'TimerClockInactive'
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    let elapsedTime = '00:00:00';
    if (this.state.startTime) {
      const totalSeconds = Math.floor((Date.now() - this.state.startTime) / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
      const seconds = totalSeconds - hours * 3600 - minutes * 60;
      elapsedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
        <div className={this.state.timerClassName}>
          {elapsedTime}
        </div>
    );
  }
}

export default TimerClock;