import type { NextPage } from "next";
import styles from "./index.module.css";
import Header from "../../components/header/header";
import ImageCard from "../../components/imgcard/imgcard";
import { Center, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'


const FrameComponent1: NextPage = () => {

  const kbStyles = {
    paddingTop: '5%'
  }

  return (
    <div>
      <Header />
      <Center style={kbStyles}>
        <Tabs>
          <TabList>
            <Tab>Recent</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={3} spacingX='30px' spacingY='10px'>
                <ImageCard />
                <ImageCard />
                <ImageCard />
                <ImageCard />
                <ImageCard />
                <ImageCard />
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Center>
    </div>
  );
};

export default FrameComponent1;
