import React, { Component, Fragment } from 'react';
import AuthContext from '../contexts/auth-context';
import axios from 'axios';
import Backdrop from '../components/Backdrop';
import Modal from '../components/Modal';
import './User.css'

class UserPage extends Component {
    state = {
        isLoading: true,
        isCreating: false,
        count: 0,
        page: 0,
        users: [],

    }

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.usernameElRef = React.createRef();
        this.passwordElRef = React.createRef();
        this.confirm_passwordElRef = React.createRef();
        this.nameElRef = React.createRef();
    }

    componentDidMount() {
        const { baseURL, accessToken } = this.context;

        axios.get(baseURL + '/admin/user', { headers: { "Authorization": `Bearer ${accessToken}` } })
            .then(data => {
                console.log(data);
                this.setState({
                    users: data.data.result.rows,
                    count: data.data.result.count,
                    isLoading: false
                })
            })
            .catch(error => {
                console.log(error.response);
                if (error.response.data.error === "Token expired!") {
                    this.context.refresh();
                    window.location.reload();
                } else {
                    alert(error.response.data.error);
                    this.context.logout();
                }
            });
    }

    startCreatingUserHandler = () => {
        this.setState({ isCreating: true });
    }

    modalCancelHandler = () => {
        this.setState({ isCreating: false });
    }

    modalConfirmHandler = () => {
        const username = this.usernameElRef.current.value;
        const name = this.nameElRef.current.value;
        const password = this.passwordElRef.current.value;
        const confirm_password = this.confirm_passwordElRef.current.value;

        if (password !== confirm_password) {
            alert("Password Mismatch!");
            return null;
        }
        this.setState({ isCreating: false });
    }

    render() {
        const users = this.state.users.map(user => {
            return (
                <Fragment key={user.id}>
                    <tr>
                        <td>{user.email}</td>
                        <td>{user.name}</td>
                        <td>{user.sourceIP}</td>
                        <td>{user.updatedAt}</td>
                        <td><button className="user-btn">Edit</button><button className="user-btn">Delete</button></td>
                    </tr>
                </Fragment>
            )
        })
        return (
            <Fragment>
                {this.state.isCreating && <Backdrop />}
                {this.state.isCreating && (
                    <Modal
                        title="Add User"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalConfirmHandler}
                        confirmText="Create"
                    >
                        <form>
                            <div className="form-control">
                                <label htmlFor="username">Username</label>
                                <input type="email" id="username" ref={this.usernameElRef} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="name">Full Name</label>
                                <input type="text" id="name" ref={this.nameElRef} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" ref={this.passwordElRef} />
                            </div>
                            <div className="form-control">
                                <label htmlFor="confirm_password">Verify Password</label>
                                <input type="password" id="confirm_password" ref={this.confirm_passwordElRef} />
                            </div>
                        </form>
                    </Modal>
                )}
                <div className="user-control">
                    <button className="btn" onClick={this.startCreatingUserHandler}>
                        Create User
                    </button>
                </div>
                <table className="user-list">
                    <thead>
                        <tr>
                            <th>Username</th><th>Full Name</th><th>Source IP</th><th>Last Updated</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>{users}</tbody>
                </table>
            </Fragment>
        )
    }
}

export default UserPage;