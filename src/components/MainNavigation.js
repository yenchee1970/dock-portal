import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../contexts/auth-context';
import './MainNavigation.css';

const mainNavigation = props => (
	<AuthContext.Consumer>
		{context => {
			return (
				<header className="main-navigation">
					<div className="main-navigation__logo">
						<h1>Dock Portal</h1>
					</div>
					<nav className="main-navigation__items">
						<ul>
							{!context.isAuth && (
								<li>
									<NavLink to="/auth">Authenticate</NavLink>
								</li>
							)}

							{context.isAuth && (
								<Fragment>
									<li>
										<NavLink to="/org">Organization</NavLink>
									</li>
									<li>
										<NavLink to="/user">User</NavLink>
									</li>
									<li>
										<NavLink to="/dock">Dock</NavLink>
									</li>
									<li>
										<button onClick={context.logout}>Logout</button>
									</li>
								</Fragment>
							)}
						</ul>
					</nav>
				</header>
			);
		}}
	</AuthContext.Consumer>
);

export default mainNavigation;