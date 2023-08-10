import type { NextPage } from "next";
import Header from "../../components/header/header";
import ImageCard from "../../components/imgcard/imgGrpCard";
import { Box, Center, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { items } from '../../components/data/homeData'

const kbStyles = {
  paddingTop: '5%'
}

const Home: NextPage = () => {

  return (
    <div>
      <Box position="sticky" w="100%" top="0" zIndex="20">
        <Header />
      </Box>
      <Center style={kbStyles}>
        <Tabs>
          <TabList>
            <Tab>Recent</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={3} spacingX='30px' spacingY='10px'>
                {
                  items.map((item, index) => {
                    return (
                      <ImageCard key={item['key']} item={item}/>
                    )
                  }
                  )
                }
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Center>
    </div>
  );
};

export default Home;
