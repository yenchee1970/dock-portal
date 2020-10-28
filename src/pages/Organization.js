import React, { Component, Fragment } from 'react';
import AuthContext from '../contexts/auth-context';
import Backdrop from '../components/Backdrop/Backdrop';
import Modal from '../components/Modal/Modal';
import Spinner from '../components/Spinner/Spinner';
import OrgList from '../components/OrgList/OrgList';

import './Organization.css'

class OrgPage extends Component {
    state = {
        isLoading: false,
        modalType: null,
        selectedOrg: null,
        count: 0,
        page: 0,
        orgs: []
    }

    static contextType = AuthContext;

    isActive = true;

    constructor(props) {
        super(props);
        this.state.realm = this.state.name = "";
    }

    componentDidMount() {
        this.loadOrgs();
    }

    networkError(error) {
        console.log(error.response);
        alert(error.response.data.error);
        if (error.response.status === 401 || error.response.data.error === "Admin role required!") this.context.logout();
    }

    async loadOrgs() {
        this.setState({ isLoading: true });
        let data = await this.fetchOrgs();
        console.log("Fetching data is ", data);
        if (this.isActive && data)
            this.setState({ orgs: data.data.result.rows, count: data.data.result.count, isLoading: false });
    }

    async fetchOrgs() {
        const { clientConn } = this.context;

        return new Promise((resolve, reject) => {
            clientConn.get('/admin/org')
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    this.networkError(error);
                    resolve(null);
                });
        });
    }

    async fetchAOrg(id) {
        const { clientConn } = this.context;

        return new Promise((resolve, reject) => {
            clientConn.get('/admin/org/' + id)
                .then(data => {
                    resolve(data.data.result);
                })
                .catch(error => {
                    this.networkError(error);
                    resolve(null);
                });
        });
    }

    async createOrg(realm, name) {
        const { clientConn } = this.context;

        return new Promise((resolve, reject) => {
            let body = null;
            if (realm) body = { ...body, realm: realm };
            if (name) body = { ...body, name: name };
            clientConn.post('/admin/org', body)
                .then(data => {
                    resolve(true);
                })
                .catch(error => {
                    this.networkError(error);
                    resolve(false);
                });
        });
    }

    async updateOrg(id, name) {
        const { clientConn } = this.context;

        return new Promise((resolve, reject) => {
            let body = null;
            if (name) body = { ...body, name: name };

            clientConn.post('/admin/org/' + id, body)
                .then(data => {
                    resolve(true);
                })
                .catch(error => {
                    this.networkError(error);
                    resolve(false);
                });
        });
    }

    async deleteOrg(id) {
        const { clientConn } = this.context;

        return new Promise((resolve, reject) => {
            clientConn.delete('/admin/org/' + id)
                .then(data => {
                    resolve(true);
                })
                .catch(error => {
                    this.networkError(error);
                    resolve(false);
                });
        });
    }

    startCreatingOrgHandler = () => {
        this.setState({ modalType: "create"});
    }

    modalCancelHandler = () => {
        this.setState({ modalType: null, realm: "", name: "" });
    }

    modalCreateHandler = async () => {
        const { realm, name } = this.state;

        let success = await this.createOrg(realm, name);
        console.log("Creating org is ", success);
        this.loadOrgs();
        this.modalCancelHandler();
    }

    modalDeleteHandler = async () => {
        let success = await this.deleteOrg(this.state.selectedOrg.id);
        console.log("Deleting org is ", success);
        this.loadOrgs();
        this.modalCancelHandler();
    }

    modalUpdateHandler = async () => {
        const { selectedOrg, name } = this.state;

        let success = await this.updateOrg(selectedOrg.id, name);
        console.log("Updating org is ", success);
        this.loadOrgs();
        this.modalCancelHandler();
    }

    onClickOrg = async (userId, type) => {
        let selectedOrg = await this.fetchAOrg(userId);
        if (selectedOrg) {
            this.setState({ selectedOrg: selectedOrg, realm: selectedOrg.realm, name: selectedOrg.name, modalType: type })
        }
    }

    onInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    componentWillUnmount() {
        this.isActive = false;
    }

    render() {
        return (
            <Fragment>
                {this.state.modalType && <Backdrop />}
                {(this.state.modalType === "create") && (
                    <Modal
                        title="Add Organization"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalCreateHandler}
                        confirmText="Create"
                    >
                        <form>
                            <div className="form-control">
                                <label htmlFor="realm">Realm</label>
                                <input type="email" id="realm" name="realm" placeholder="Email domain adress" onChange={this.onInputChange} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="name">Full Name</label>
                                <input type="text" id="name" name="name" placeholder="Full Name" onChange={this.onInputChange} />
                            </div>
                        </form>
                    </Modal>
                )}
                {(this.state.modalType === "edit") && (
                    <Modal
                        title="Edit Organization"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalUpdateHandler}
                        confirmText="Update"
                    >
                        <form>
                            <div className="form-control">
                                <label htmlFor="realm">Realm</label>
                                <input type="email" id="realm" name="realm" disabled={true} value={this.state.realm} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="name">Full Name</label>
                                <input type="text" id="name" name="name" value={this.state.name} onChange={this.onInputChange} />
                            </div>
                        </form>
                    </Modal>
                )}
                {(this.state.modalType === "delete") && (
                    <Modal
                        title="Delete Organization"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalDeleteHandler}
                        confirmText="Delete"
                    >
                        <div>
                            Are you really want to delete <strong className="strong-text">{this.state.selectedOrg.realm}</strong>?
                        </div>
                    </Modal>
                )}
                <div className="user-control">
                    <button className="btn" onClick={this.startCreatingOrgHandler}>
                        Create Organization
                    </button>
                </div>
                { this.state.isLoading ? (<Spinner />) : (
                    <OrgList
                        orgs={this.state.orgs}
                        onClickOrg={this.onClickOrg}
                    />)
                }
            </Fragment>
        )
    }
}

export default OrgPage;