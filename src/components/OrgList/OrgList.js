import React from 'react';
import OrgItem from '../OrgItem/OrgItem';
import './OrgList.css';

const orgList = props => (
    <div className="org-list">
        <table>
            <thead>
                <tr>
                    <th>Realm</th><th>Full Name</th><th>Created At</th><th>Last Updated</th><th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {props.orgs.map(org => {
                    return (
                        <OrgItem
                            key={org.id}
                            org={org}
                            onClickOrg={props.onClickOrg}
                        />
                    )
                })}
            </tbody>
        </table>
    </div>
);

export default orgList;
