// React imports
import React, { useEffect } from "react";
import type { AppProps } from "next/app";

// Next.js imports
import Head from "next/head";

// Chakra UI imports
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

// Emotion imports
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

// Redux imports
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import persistedReducer from '../components/state' // import persistedReducer instead of rootReducer

// Other library imports
import { clarity } from 'react-microsoft-clarity';

// Local imports
import "./global.css";
import { MS_CLARITY_ID } from '../components/state/const';
import { getSignInUserId } from "../components/util/actionUtil";

const chakraTheme = extendTheme({
  styles: { global: { img: { maxWidth: "unset" } } },
});
const emotionCache = createCache({
  key: "emotion-cache",
  prepend: true,
});

const store = configureStore({
  reducer: persistedReducer
})

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (MS_CLARITY_ID) {
      clarity.init(MS_CLARITY_ID);
      // Check if Clarity has been initialized before calling its methods
      // https://stackoverflow.com/questions/72210974/microsoft-clarity-not-working-with-next-js-react-js-project
      if (clarity.hasStarted()) {
        const userId = getSignInUserId();
        if (userId) {
          clarity.identify(userId, { userProperty: userId });
        }
      }
    }
  }, []);

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