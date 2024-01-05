import React, {Component} from 'react';
import PropTypes from "prop-types";

class ListAllSupportedConstraints extends Component {
  static propTypes = {
    supportedConstraints: PropTypes.object,
  }
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
        <div className="devicesContainer">
          <ul>
            {Object.keys(this.props.supportedConstraints).map(keyName => (
                <li key={keyName}>{keyName} ({this.props.supportedConstraints[keyName].toString()})</li>
            ))}
          </ul>
        </div>
    );
  }
}

export default ListAllSupportedConstraints;
