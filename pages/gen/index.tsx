import type { NextPage } from "next";
import Header from "../../components/header/header";
import NewSidePanel from "../../components/sidepanel/sidepanel";
import DragDropBoard from "../../components/dnd";

import React, { useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { useSelector } from "react-redux";

const welcomeMessage = {
  position: 'absolute',
  top: '30vh',
  left: '45vw',
  width: '488px',
  height: '351px',
  overflow: 'hidden'
} as React.CSSProperties;

const welcomeLabel = {
  position: 'absolute',
  top: '70vh',
  left: '50vw',
  lineHeight: '20px',
  fontWeight: 600,
  display: 'inline-block',
  width: '536px',
  height: '45px'
} as React.CSSProperties;

const NewPage: NextPage = () => {
  const dataPayload = useSelector((state: any) => state.datas.ImageDataPayload);
  const [isLoaded, setIsLoaded] = React.useState(true);

  useEffect(() => {
    if (dataPayload.length > 0) {
      setIsLoaded(true);
    } else {
      setIsLoaded(true);
    }
  }, [dataPayload])

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
            <DragDropBoard dataPayload={dataPayload}/>
          </Box>
          :
          <Box display='flex' justifyContent='center' alignItems='center'>
            <img
              style={welcomeMessage}
              alt=""
              src="/welcome-screen-simple.svg"
            />
            <div style={welcomeLabel}>Card previews appear here</div>
          </Box>
        }
      </Box>
    </>
  );
};

export default NewPage;
