import './ListAllDevices.css'
import React, {Component} from 'react';
import {Table} from "react-bootstrap";
import PropTypes from "prop-types";

class ListAllDevices extends Component {
  static propTypes = {
    devices: PropTypes.array,
  }

  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
        <div className="devicesContainer">
          <Table className="Devices">
            <thead>
            <tr>
              <th>Type</th>
              <th>Id</th>
              <th>Label</th>
            </tr>
            </thead>
            <tbody>
            {this.props.devices.map(device => (
                <tr key={device.kind + device.deviceId}>
                  <td>{device.kind}</td>
                  <td>{device.deviceId}</td>
                  <td>{device.label}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
    );
  }
}

export default ListAllDevices;
