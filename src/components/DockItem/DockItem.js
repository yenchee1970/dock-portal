import React, { Fragment } from 'react';

import './DockItem.css';

const dockItem = props => {
    return (
        <Fragment key={props.dock.id}>
            <tr>
                <td>{props.dock.macaddr}</td>
                <td>{props.dock.bssid5GL}</td>
                <td>{props.dock.ssid5GL}</td>
                <td>{props.dock.bssid2G}</td>
                <td>{props.dock.ssid2G}</td>
                <td>{props.dock.sourceIP}</td>
                <td>{new Date(props.dock.updatedAt).toLocaleString()}</td>
                <td>
                    <button className="dock-btn" onClick={props.onClickDock.bind(this, props.dock.id, "edit")}>Edit</button>
                    <button className="dock-btn" onClick={props.onClickDock.bind(this, props.dock.id, "delete")}>Delete</button>
                </td>
            </tr>
        </Fragment>
    );
};

export default dockItem;
