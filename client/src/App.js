import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';

// Components
import Navbar from './components/Navbar';

// Routes
import HomePage from './pages/home';
import SignupPage from './pages/signup';
import LoginPage from './pages/login';

// Styles
import theme from './styles/theme';
import './styles/App.scss';

function App() {
	return (
		<MuiThemeProvider theme={theme}>
			<div className="App">
				<Router>
					<Navbar />
					<div className="container">
						<Switch>
							<Route exact path="/" component={HomePage} />
							<Route exact path="/signup" component={SignupPage} />
							<Route exact path="/login" component={LoginPage} />
						</Switch>
					</div>
				</Router>
			</div>
		</MuiThemeProvider>
	);
}

export default App;
