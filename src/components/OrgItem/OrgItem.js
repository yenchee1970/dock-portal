import React, { Fragment } from 'react';

import './OrgItem.css';

const orgItem = props => {
    return (
        <Fragment key={props.org.id}>
            <tr>
                <td>{props.org.realm}</td>
                <td>{props.org.name}</td>
                <td>{new Date(props.org.createdAt).toLocaleString()}</td>
                <td>{new Date(props.org.updatedAt).toLocaleString()}</td>
                <td>
                    <button className="user-btn" onClick={props.onClickOrg.bind(this, props.org.id, "edit")}>Edit</button>
                    <button className="user-btn" onClick={props.onClickOrg.bind(this, props.org.id, "delete")}>Delete</button>
                </td>
            </tr>
        </Fragment>
    );
};

export default orgItem;
