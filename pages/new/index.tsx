import type { NextPage } from "next";
import styles from "./index.module.css";
import Header from "../../components/header/header";
import NewSidePanel from "../../components/sidepanel/newsidepanel";
import DragDropBoard from "../../components/dnd";

import React from "react";
import { Box } from "@chakra-ui/react";

const NewPage: NextPage = () => {

  const [isLoaded, setIsLoaded] = React.useState(true);

  return (
    <>
      <Box position="sticky" w="100%" top="0" zIndex="20">
        <Header />
      </Box>
      <Box minHeight="100vh" overflow="auto" zIndex="10" >
        <NewSidePanel />
        {isLoaded ?
          // display='flex'
          // justifyContent='center' -> vertical direction
          // alignItems='center' -> horizontal direction
          // https://qiita.com/piyonakajima/items/1b48a42a7a6e44bc57c9
          <Box display='flex' justifyContent='center' alignItems='center' mt="3vh">
            <DragDropBoard />
          </Box>
          :
          <Box display='flex' justifyContent='center' alignItems='center'>
            <img
              className={styles.freWelcomeScreenSimple}
              alt=""
              src="/fre--welcome-screen-simple.svg"
            />
            <div className={styles.label4}>Card previews appear here</div>
          </Box>
        }
      </Box>
    </>
  );
};

export default NewPage;
