import React from 'react';
import DockItem from '../DockItem/DockItem';
import './DockList.css';

const dockList = props => {
    const docks = props.docks.map(dock => {
        return (
            <DockItem
                key={dock.id}
                dock={dock}
                onClickUser={props.onClickUser}
            />
        )
    });

    return (
        <table className="dock-list">
            <thead>
                <tr>
                    <th>MAC address</th><th>5G BSSID</th><th>5G SSID</th><th>2.4G BSSID</th><th>2.4G SSID</th><th>Source IP</th><th>Last Updated</th><th>Actions</th>
                </tr>
            </thead>
            <tbody>{docks}</tbody>
        </table>
    );
};

export default dockList;
