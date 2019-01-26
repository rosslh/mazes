import React from 'react';
import { Root, Routes, Head } from 'react-static';
// import { css } from '@emotion/core';
import 'modern-normalize/modern-normalize.css';

const App = () => (
  <Root>
    <Head>
      <meta property="og:title" content="Mazes" />
      <meta property="og:description" content="Mazes" />
      <meta property="og:url" content="" />
      <meta charSet="UTF-8" />
      {/* <link
            rel="apple-touch-icon"
            sizes="120x120"
            href={require(`./assets/apple-touch-icon.png`)}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href={require(`./assets/favicon-32x32.png`)}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href={require(`./assets/favicon-16x16.png`)}
          /> */}
      <title>Maze</title>
    </Head>
    <div>
      <Routes />
    </div>
  </Root>
);

export default App;
