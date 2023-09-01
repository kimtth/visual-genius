import React from "react";
import Head from "next/head";
import type { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import "./global.css";
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from '../components/state'

const chakraTheme = extendTheme({
  styles: { global: { img: { maxWidth: "unset" } } },
});
const emotionCache = createCache({
  key: "emotion-cache",
  prepend: true,
});

const store = configureStore({
  reducer: rootReducer
})


function App({ Component, pageProps }: AppProps) {
  return (
    <React.Fragment>
      <Provider store={store}>
        <Head>
          <title>Visual Genius</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
        </Head>
        <CacheProvider value={emotionCache}>
          <ChakraProvider theme={chakraTheme}>
            <Component {...pageProps} />
          </ChakraProvider>
        </CacheProvider>
      </Provider>
    </React.Fragment>
  );
}

export default App;
