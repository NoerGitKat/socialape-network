import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Components
import Grid from '@material-ui/core/Grid';
import LoadingSpinner from './../components/LoadingSpinner';

const HomePage = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState();
	const [screams, setScreams] = useState([]);

	useEffect(() => {
		async function fetchScreams() {
			try {
				setIsLoading(true);
				const response = await axios.get('/screams');
				setScreams(response.data);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		}

		fetchScreams();
	}, []);

	return (
		<Grid container spacing={2}>
			<Grid item sm={6} xs={12}>
				{!isLoading && screams.length > 0 ? (
					<ul>
						{screams.map((scream) => (
							<li key={scream.screamId}>{scream.body}</li>
						))}
					</ul>
				) : (
					<LoadingSpinner />
				)}
			</Grid>
			<Grid item sm={6} xs={12}>
				<p>Profile..</p>
			</Grid>
		</Grid>
	);
};

export default HomePage;
