import React from 'react';
import { withRouteData } from 'react-static';
import Maze from '../components/maze';

const Home = props => <Maze {...props} />;

export default withRouteData(Home);
