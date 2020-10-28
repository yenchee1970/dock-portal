import React, { Component, Fragment } from 'react';
import AuthContext from '../contexts/auth-context';
import Backdrop from '../components/Backdrop/Backdrop';
import Modal from '../components/Modal/Modal';
import Spinner from '../components/Spinner/Spinner';
import UserList from '../components/UserList/UserList';
import './User.css'

class UserPage extends Component {
    state = {
        isLoading: false,
        modalType: null,
        selectedUser: null,
        count: 0,
        page: 0,
        users: []
    }

    static contextType = AuthContext;

    isActive = true;

    constructor(props) {
        super(props);
        this.state.email = this.state.name = this.state.password = this.state.confirm_password = this.state.role = null;
    }

    componentDidMount() {
        this.loadUsers();
    }

    networkError(error) {
        console.log(error.response);
        alert(error.response.data.error);
        if (error.response.status === 401 || error.response.data.error === "Admin role required!") this.context.logout();
    }

    async loadUsers() {
        this.setState({ isLoading: true });
        let data = await this.fetchUsers();
        console.log("Fetching data is ", data);
        if (this.isActive && data)
            this.setState({ users: data.data.result.rows, count: data.data.result.count, isLoading: false });
    }

    async fetchUsers() {
        const { clientConn } = this.context;

        return new Promise((resolve, reject) => {
            clientConn.get('/admin/user')
                .then(data => {
                    resolve(data);
                })
                .catch(error => {
                    this.networkError(error);
                    resolve(null);
                });
        });
    }

    async fetchAUser(id) {
        const { clientConn } = this.context;

        return new Promise((resolve, reject) => {
            clientConn.get('/admin/user/' + id)
                .then(data => {
                    resolve(data.data.result);
                })
                .catch(error => {
                    this.networkError(error);
                    resolve(null);
                });
        });
    }

    async createUser(username, password, name, role) {
        const { clientConn } = this.context;

        return new Promise((resolve, reject) => {
            let body = null;
            if (username) body = { ...body, username: username };
            if (password) body = { ...body, password: password };
            if (name) body = { ...body, name: name };
            if (role) body = { ...body, role: role };
            clientConn.post('/admin/user', body)
                .then(data => {
                    resolve(true);
                })
                .catch(error => {
                    this.networkError(error);
                    resolve(false);
                });
        });
    }

    async updateUser(id, password, name, role) {
        const { clientConn } = this.context;

        return new Promise((resolve, reject) => {
            let body = null;
            if (name) body = { ...body, name: name };
            if (password) body = { ...body, password: password };
            if (role) body = { ...body, role: role };

            clientConn.post('/admin/user/' + id, body)
                .then(data => {
                    resolve(true);
                })
                .catch(error => {
                    this.networkError(error);
                    resolve(false);
                });
        });
    }

    async deleteUser(id) {
        const { clientConn } = this.context;

        return new Promise((resolve, reject) => {
            clientConn.delete('/admin/user/' + id)
                .then(data => {
                    resolve(true);
                })
                .catch(error => {
                    this.networkError(error);
                    resolve(false);
                });
        });
    }

    startCreatingUserHandler = () => {
        this.setState({ modalType: "create", role: "User" });
    }

    modalCancelHandler = () => {
        this.setState({ modalType: null, username: null, password: null, confirm_password: null, name: null });
    }

    modalCreateHandler = async () => {
        const { username, name, password, confirm_password, role } = this.state;

        if (password !== confirm_password) {
            alert("Password Mismatch!");
            return null;
        }
        let success = await this.createUser(username, password, name, role);
        console.log("Creating user is ", success);
        this.loadUsers();
        this.modalCancelHandler();
    }

    modalDeleteHandler = async () => {
        let success = await this.deleteUser(this.state.selectedUser.id);
        console.log("Deleting user is ", success);
        this.loadUsers();
        this.modalCancelHandler();
    }

    modalUpdateHandler = async () => {
        const { selectedUser, name, password, confirm_password, role } = this.state;

        if (password !== confirm_password) {
            alert("Password Mismatch!");
            return null;
        }
        let success = await this.updateUser(selectedUser.id, password, name, role);
        console.log("Updating user is ", success);
        this.loadUsers();
        this.modalCancelHandler();
    }

    onClickUser = async (userId, type) => {
        let selectedUser = await this.fetchAUser(userId);
        if (selectedUser) {
            this.setState({ selectedUser: selectedUser, username: selectedUser.email, name: selectedUser.name, role: selectedUser.role, modalType: type })
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
                        title="Add User"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalCreateHandler}
                        confirmText="Create"
                    >
                        <form>
                            <div className="form-control">
                                <label htmlFor="username">Username</label>
                                <input type="email" id="username" name="username" placeholder="Email adress" onChange={this.onInputChange} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="name">Full Name</label>
                                <input type="text" id="name" name="name" placeholder="Full Name" onChange={this.onInputChange} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" name="password" onChange={this.onInputChange} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="confirm_password">Verify Password</label>
                                <input type="password" id="confirm_password" name="confirm_password" onChange={this.onInputChange} />
                            </div>
                            <div>
                                <input type="radio" name="role" value="Admin" checked={this.state.role === "Admin"} onChange={this.onInputChange} /> Admin
                                <input type="radio" name="role" value="User" checked={this.state.role === "User"} onChange={this.onInputChange} /> User
                            </div>
                        </form>
                    </Modal>
                )}
                {(this.state.modalType === "edit") && (
                    <Modal
                        title="Edit User"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalUpdateHandler}
                        confirmText="Update"
                    >
                        <form>
                            <div className="form-control">
                                <label htmlFor="username">Username</label>
                                <input type="email" id="username" disabled={true} value={this.state.username} />
                            </div>
                            {this.state.selectedUser.Organization && (
                                <div className="form-control">
                                    <label>Organization</label>
                                    <input type="text" disabled={true} value={this.state.selectedUser.Organization.name} />
                                </div>
                            )}
                            <div className="form-control">
                                <label htmlFor="name">Full Name</label>
                                <input type="text" id="name" name="name" value={this.state.name} onChange={this.onInputChange} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" onChange={this.onInputChange} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="confirm_password">Verify Password</label>
                                <input type="password" id="confirm_password" onChange={this.onInputChange} />
                            </div>
                            <div>
                                <input type="radio" name="role" value="Admin" checked={this.state.role === "Admin"} onChange={this.onInputChange} /> Admin
                                <input type="radio" name="role" value="User" checked={this.state.role === "User"} onChange={this.onInputChange} /> User
                            </div>
                        </form>
                    </Modal>
                )}
                {(this.state.modalType === "delete") && (
                    <Modal
                        title="Delete User"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalDeleteHandler}
                        confirmText="Delete"
                    >
                        <div>
                            Are you really want to delete <strong className="strong-text">{this.state.selectedUser.email}</strong>?
                        </div>
                    </Modal>
                )}
                <div className="user-control">
                    <button className="btn" onClick={this.startCreatingUserHandler}>
                        Create User
                    </button>
                </div>
                { this.state.isLoading ? (<Spinner />) : (
                    <UserList
                        users={this.state.users}
                        onClickUser={this.onClickUser}
                    />)
                }
            </Fragment>
        )
    }
}

export default UserPage;