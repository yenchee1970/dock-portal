import React, { Component, Fragment } from 'react';
import Backdrop from '../../components/Backdrop/Backdrop';
import Modal from '../../components/Modal/Modal';
import AuthContext from '../../contexts/auth-context';
import Spinner from '../../components/Spinner/Spinner';
import DockList from '../../components/DockList/DockList';

class NormalDockPage extends Component {
  state = {
    isLoading: false,
    modalType: null,
    selectedDock: null,
    count: 0,
    page: 0,
    docks: [],
    paired: false
  }

  static contextType = AuthContext;

  isActive = true;

  constructor(props) {
    super(props);
    this.state.macaddr = this.state.bssid5GL = this.state.ssid5GL = this.state.bssid2G = this.state.ssid2G = "";
  }

  componentDidMount() {
    this.loadDocks();
  }

  networkError(error) {
    console.error(error.response);
    alert(error.response.data.error);
    if (error.response.status === 401 || error.response.data.error === "Admin role required!") this.context.logout();
  }

  async loadDocks() {
    this.setState({ isLoading: true });
    let data = await this.fetchDocks();
    if (this.isActive && data)
      this.setState({ docks: data.data.result.rows, count: data.data.result.count, isLoading: false });
  }

  async fetchDocks() {
    const { clientConn } = this.context;

    return new Promise((resolve, reject) => {
      clientConn.get('/client/dock')
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          this.networkError(error);
          resolve(null);
        });
    });
  }

  async fetchADock(id) {
    const { clientConn } = this.context;

    return new Promise((resolve, reject) => {
      clientConn.get('/client/dock/' + id)
        .then(data => {
          resolve(data.data.result);
        })
        .catch(error => {
          this.networkError(error);
          resolve(null);
        });
    });
  }

  async updateDock(id, bssid5gl, ssid5gl, bssid2g, ssid2g) {
    const { clientConn } = this.context;
    let body = null;

    if (bssid5gl) body = { ...body, bssid5gl };
    if (ssid5gl) body = { ...body, ssid5gl };
    if (bssid2g) body = { ...body, bssid2g };
    if (ssid2g) body = { ...body, ssid2g };

    return new Promise((resolve, reject) => {
      clientConn.post('/client/dock/' + id, body)
        .then(data => {
          resolve(true);
        })
        .catch(error => {
          this.networkError(error);
          resolve(false);
        });
    });
  }

  modalCancelHandler = () => {
    this.setState({ modalType: null, macaddr: "", bssid5GL: "", ssid5GL: "", bssid2G: "", ssid2G: "", paired: false });
  }

  modalUpdateHandler = async () => {
    await this.updateDock(
      this.state.selectedDock.id,
      this.state.bssid5GL,
      this.state.ssid5GL,
      this.state.bssid2G,
      this.state.ssid2G
    );
    this.loadDocks();
    this.modalCancelHandler();
  }

  onClickDock = async (dockId, type) => {
    let selectedDock = await this.fetchADock(dockId);
    if (selectedDock) {
      this.setState({
        selectedDock: selectedDock,
        macaddr: selectedDock.macaddr,
        bssid5GL: selectedDock.bssid5GL,
        ssid5GL: selectedDock.ssid5GL,
        bssid2G: selectedDock.bssid2G,
        ssid2G: selectedDock.ssid2G,
        paired: selectedDock.User ? true : false,
        modalType: type
      });
    }
    // console.log(selectedDock);
  }

  onInputChange = (e) => {
    const pattern = /^[0-9A-Fa-f:-]{0,17}$/;
    let update = true;
    switch (e.target.name) {
      case "macaddr":
      case "bssid5GL":
      case "bssid2G":
        if (!pattern.test(e.target.value)) update = false;
        break;
      default:
        update = true;
    }
    if (update) this.setState({ [e.target.name]: e.target.value });
  }

  doNothing = () => {}

  componentWillUnmount() {
    this.isActive = false;
  }

  render() {
    return (
      <Fragment>
        {this.state.modalType && <Backdrop />}
        {(this.state.modalType === "edit") && (
          <Modal
            title="Edit Dock"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalUpdateHandler}
            confirmText="Update"
          >
            <form>
              <div className="form-control">
                <label htmlFor="macaddr">MAC address</label>
                <input type="text" id="macaddr" name="macaddr" placeholder="MAC address" value={this.state.macaddr} disabled={true} />
              </div>
              <div className="form-control">
                <label htmlFor="bssid5GL">5GHz BSSID</label>
                <input type="text" id="bssid5GL" name="bssid5GL" placeholder="MAC address" value={this.state.bssid5GL} onChange={this.onInputChange} />
              </div>
              <div className="form-control">
                <label htmlFor="ssid5GL">5GHz SSID</label>
                <input type="text" id="ssid5GL" name="ssid5GL" value={this.state.ssid5GL} onChange={this.onInputChange} />
              </div>
              <div className="form-control">
                <label htmlFor="bssid2G">2.4GHz BSSID</label>
                <input type="text" id="bssid2G" name="bssid2G" placeholder="MAC address" value={this.state.bssid2G} onChange={this.onInputChange} />
              </div>
              <div className="form-control">
                <label htmlFor="ssid2G">2.4GHz SSID</label>
                <input type="text" id="ssid2G" name="ssid2G" value={this.state.ssid2G} onChange={this.onInputChange} />
              </div>
              {(this.state.selectedDock.User && this.state.selectedDock.Organization) &&
                <div className="dock-owner">
                  <input type="checkbox" id="paired1" name="paired" checked={this.state.paired} onChange={this.doNothing} />
                  <label>Owned</label>
                  <p>{this.state.selectedDock.User.email} in {this.state.selectedDock.Organization.name}</p>
                </div>
              }
              {(this.state.selectedDock.User && !this.state.selectedDock.Organization) &&
                <div className="dock-owner">
                  <input type="checkbox" id="paired2" name="paired" checked={this.state.paired} onChange={this.doNothing} />
                  <label>Owned</label>
                  <p>{this.state.selectedDock.User.email}</p>
                </div>
              }
            </form>
          </Modal>
        )}
        { this.state.isLoading ? (<Spinner />) : (
          <DockList
            docks={this.state.docks}
            onClickDock={this.onClickDock}
          />)
        }
      </Fragment>
    )
  }
}

export default NormalDockPage;