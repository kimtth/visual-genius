import React, { useEffect } from "react";
import Head from "next/head";
import type { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import "./global.css";
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from '../components/state'
import { clarity } from 'react-microsoft-clarity';
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
  reducer: rootReducer
})

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if (MS_CLARITY_ID) {
      clarity.init(MS_CLARITY_ID);
      // Check if Clarity has been initialized before calling its methods
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
          {/* https://stackoverflow.com/questions/72210974/microsoft-clarity-not-working-with-next-js-react-js-project */}
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
