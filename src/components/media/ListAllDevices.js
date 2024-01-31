import './ListAllDevices.css'
import React, { Component } from 'react';
import {Table} from "react-bootstrap";
import PropTypes from "prop-types";

class ListAllDevices extends Component {
  static propTypes = {
    devices: PropTypes.array,
  }
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    return (
        <div className="devicesContainer">
          <Table className="Devices">
            {this.props.devices.map(device => (
                <tbody key={device.kind+device.deviceId}>
                  <tr>
                    <td className="title" colSpan={2}>{device.kind}</td>
                  </tr>
                  <tr>
                    <td className="title">deviceId</td>
                    <td>{device.deviceId}</td>
                  </tr>
                  <tr>
                    <td className="title">label</td>
                    <td>{device.label}</td>
                  </tr>
                </tbody>
            ))}
          </Table>
        </div>
    );
  }
}

export default ListAllDevices;
