import React, { Component } from 'react';
import Modal from '../../components/Modal/Modal';
import AuthContext from '../../contexts/auth-context';
import Spinner from '../../components/Spinner/Spinner';

class NormalUserPage extends Component {
    state = {
        isLoading: false,
        username: "",
        name: "",
        password: "",
        confirm_password: ""
    }

    static contextType = AuthContext;

    componentDidMount() {
        this.setState({ isLoading: true });

        this.loadUser()
            .then(data => {
                const { email, name } = data.data.result;
                this.setState({ username: email, name: name, isLoading: false });
            })
            .catch(() => {
                this.setState({ isLoading: false });
            });
    }

    loadUser = async () => {
        const { clientConn } = this.context;

        return new Promise((resolve, reject) => {
            clientConn.get('/client/user')
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    this.networkError(error);
                    reject(error);
                });
        });
    }

    updateUser = async (name, password) => {
        const { clientConn } = this.context;
        let body = null;
        if (name) body = { ...body, name };
        if (password) body = { ...body, password };

        return new Promise ((resolve, reject) =>{
            clientConn.post('/client/update', body)
            .then(() => {
                resolve(true);
            })
            .catch(error => {
                this.networkError(error);
                resolve(false);
            })
        });
    }

    networkError(error) {
        console.log(error.response);
        alert(error.response.data.error);
        if (error.response.status === 401 || error.response.data.error === "Admin role required!") this.context.logout();
    }

    modalUpdateHandler = async () => {
        const { name, password, confirm_password } = this.state;

        if (password !== confirm_password) {
            alert("Password Mismatch!");
            return null;
        }
        let success = await this.updateUser(name, password);
        if (success) alert("User update successfully!");
    }

    onInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        return this.state.isLoading ? (<Spinner />) : (
            <Modal
                title="Edit User"
                canConfirm
                onConfirm={this.modalUpdateHandler}
                confirmText="Update"
            >
                <form>
                    <div className="form-control">
                        <label htmlFor="username">Username</label>
                        <input type="email" id="username" disabled={true} value={this.state.username} />
                    </div>
                    <div className="form-control">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" name="name" value={this.state.name} onChange={this.onInputChange} />
                    </div>
                    <div className="form-control">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" onChange={this.onInputChange} />
                    </div>
                    <div className="form-control">
                        <label htmlFor="confirm_password">Verify Password</label>
                        <input type="password" id="confirm_password" name="confirm_password" onChange={this.onInputChange} />
                    </div>
                </form>
            </Modal>
        )
    }
}

export default NormalUserPage;