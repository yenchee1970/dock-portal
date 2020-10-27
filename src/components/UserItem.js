import React, { Fragment } from 'react';

import './UserItem.css';

const userItem = props => {
    return (
        <Fragment key={props.user.id}>
            <tr>
                <td>{props.user.email}</td>
                <td>{props.user.name}</td>
                <td>{props.user.sourceIP}</td>
                <td>{new Date(props.user.updatedAt).toLocaleString()}</td>
                <td>
                    <button className="user-btn" onClick={props.onClickUser.bind(this, props.user.id, "edit")}>Edit</button>
                    <button className="user-btn" onClick={props.onClickUser.bind(this, props.user.id, "delete")}>Delete</button>
                </td>
            </tr>
        </Fragment>
    );
};

export default userItem;
