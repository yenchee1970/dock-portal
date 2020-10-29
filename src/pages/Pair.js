import React, { Component, Fragment } from 'react';
import Modal from '../components/Modal/Modal';
import AuthContext from '../contexts/auth-context';

class PairPage extends Component {

    state = {
        username: "",
        macaddr: ""
    }

    static contextType = AuthContext;

    networkError(error) {
        console.log(error.response);
        alert(error.response.data.error);
        if (error.response.status === 401 || error.response.data.error === "Admin role required!") this.context.logout();
    }

    modalCreateHandler = () => {
        const { clientConn } = this.context;

        let mac = this.state.macaddr;
        let username = this.state.username;

        clientConn.post('/admin/pair', { mac, username })
            .then(() => {
                alert("Success!");
                this.setState({ username: "", macaddr: "" });
            })
            .catch(error => {
                this.networkError(error);
            });
    }

    onInputChange = (e) => {
        const pattern = /^[0-9A-Fa-f:-]{0,17}$/;
        let update = true;
        switch (e.target.name) {
            case "macaddr":
                if (!pattern.test(e.target.value)) update = false;
                break;
            default:
                update = true;
        }
        if (update) this.setState({ [e.target.name]: e.target.value });
    }


    render() {
        return (
            <Fragment>
                <Modal
                    title="Pair User and Dock"
                    canConfirm
                    onConfirm={this.modalCreateHandler}
                    confirmText="Pair"
                >
                    <form>
                        <div className="form-control">
                            <label htmlFor="username">Username</label>
                            <input type="email" id="username" name="username" placeholder="User's email address" value={this.state.username} onChange={this.onInputChange} />
                        </div>
                        <div className="form-control">
                            <label htmlFor="macaddr">MAC Address</label>
                            <input type="text" id="macaddr" name="macaddr" placeholder="Dock's MAC address" value={this.state.macaddr} onChange={this.onInputChange} />
                        </div>
                    </form>
                </Modal>
            </Fragment>
        )
    }
}

export default PairPage;