import './Footer.css';
import {Component} from 'react';
import PropTypes from "prop-types";
import {Tab, Tabs, Button} from "react-bootstrap";
import ListAllDevices from "./ListAllDevices";
import ListAllSupportedConstraints from "./ListAllSupportedConstraints";
import MediaTrackSettings from "./MediaTrackSettings";
import {FaAngleDown, FaAngleUp} from "react-icons/fa";

class Footer extends Component{
  static propTypes = {
    devices: PropTypes.array,
    footerOpen: PropTypes.bool,
    selectedDeviceTracks: PropTypes.array,
    supportedConstraints: PropTypes.object,
    toggleFooter: PropTypes.func,
  }

  constructor(props){
    super(props);
    this.state = {
    };
  }

  render(){
      const footerIcon = !this.props.footerOpen ? <FaAngleUp /> : <FaAngleDown />;
        return (
            <footer>
              <Button className="footer-toggle"
                      variant={"outline-secondary"}
                      onClick={this.props.toggleFooter}>{footerIcon}</Button>
              <Tabs
                  defaultActiveKey="activeSettingsTab"
                  transition={true}
                  id="noanim-tab-example"
                  className="mb-3"
              >
                <Tab eventKey="activeSettingsTab" title="Live Settings">
                  <MediaTrackSettings
                      tracks={this.props.selectedDeviceTracks}/>
                </Tab>
                <Tab eventKey="devicesTab" title="Available Devices">
                  <ListAllDevices devices={this.props.devices}/>
                </Tab>
                <Tab eventKey="debugTab" title="Supported Constraints">
                  <ListAllSupportedConstraints
                      supportedConstraints={this.props.supportedConstraints} />
                </Tab>
              </Tabs>
            </footer>
        );
    }
}

export default Footer;