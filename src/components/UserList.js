import React from 'react';
import UserItem from './UserItem';
import './UserList.css';

const userList = props => {
    const users = props.users.map(user => {
        return (
            <UserItem
                key={user.id}
                user={user}
                onClickUser={props.onClickUser}
            />
        )
    });

    return (
        <table className="user-list">
            <thead>
                <tr>
                    <th>Username</th><th>Full Name</th><th>Source IP</th><th>Last Updated</th><th>Actions</th>
                </tr>
            </thead>
            <tbody>{users}</tbody>
        </table>
    );
};

export default userList;
