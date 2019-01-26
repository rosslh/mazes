// import maze from './mazes/2018-01-23.json';
import maze from './maze.json';

export default {
  getRoutes: async () => {
    return [
      {
        path: `/`,
        component: `src/pages/index.js`,
        getData: () => ({
          maze
        })
      }
    ];
  }
};
