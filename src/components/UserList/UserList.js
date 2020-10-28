import React from 'react';
import UserItem from '../UserItem/UserItem';
import './UserList.css';

const userList = props => (
    <table className="user-list">
        <thead>
            <tr>
                <th>Username</th><th>Full Name</th><th>Source IP</th><th>Last Updated</th><th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {props.users.map(user => {
                return (
                    <UserItem
                        key={user.id}
                        user={user}
                        onClickUser={props.onClickUser}
                    />
                )
            })}
        </tbody>
    </table>
);

export default userList;
