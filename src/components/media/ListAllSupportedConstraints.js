import React, {Component} from 'react';
import PropTypes from "prop-types";
import {Table} from "react-bootstrap";

class ListAllSupportedConstraints extends Component {
  static propTypes = {
    supportedConstraints: PropTypes.object,
  }

  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
        <div className="devicesContainer">
          <Table>
            <thead>
            <tr>
              <th>Constraint</th>
              <th>Supported</th>
            </tr>
            </thead>
            <tbody>
            {Object.keys(this.props.supportedConstraints).map(keyName => (
                <tr key={keyName}>
                  <td>{keyName}</td>
                  <td>{this.props.supportedConstraints[keyName] ? 'Yes' : 'No'}</td>
                </tr>
            ))}
            </tbody>
          </Table>
        </div>
    );
  }
}

export default ListAllSupportedConstraints;
