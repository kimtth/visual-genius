import type { NextPage } from "next";
import Header from "../../components/header/header";
import { Button, Text, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs, Box, VStack, Divider, Checkbox, HStack, ButtonGroup } from "@chakra-ui/react";
import ResultCard from "../../components/imgcard/resultcard";
import { BiUpload } from "react-icons/bi";

const FrameComponent1: NextPage = () => {

  return (
    <>
      <Header />
      <>
        <VStack position={'absolute'} top={'8vh'} left={'20px'} padding={'5px'} alignItems="left">
          <Box display="flex" alignItems="center" paddingLeft={'5px'}>
            <Text fontWeight='bold' fontSize='2xl'>Select your photos</Text>
          </Box>
          {/* <Box display="flex" top={1} paddingLeft={'5px'} textAlign={"right"}> */}
          <HStack justifyContent="right">
            <Button aria-label='Upload'
              leftIcon={<BiUpload />}
              size='sm'
              variant="outline"
              colorScheme='gray'
              borderRadius='1px'
            >Upload My own photos</Button>
          </HStack>
          <Box>
            <Tabs defaultIndex={0} width={'80vw'}>
              <TabList>
                <Tab width="20vw">All</Tab>
                <Tab width="20vw">Photos</Tab>
                <Tab width="20vw">Emojis</Tab>
                <Tab width="20vw">My Photos</Tab>
              </TabList>
              <TabPanels height={'72vh'}>
                <TabPanel>
                  <SimpleGrid spacing={4} columns={5}>
                    <ResultCard imgPath="rectangle-3469579@2x.png" />
                    <ResultCard imgPath="rectangle-3469579@2x.png" />
                    <ResultCard imgPath="rectangle-3469579@2x.png" />
                    <ResultCard imgPath="rectangle-3469579@2x.png" />
                    <ResultCard imgPath="rectangle-3469579@2x.png" />
                    <ResultCard imgPath="rectangle-3469579@2x.png" />
                  </SimpleGrid>
                </TabPanel>
                <TabPanel>
                  <SimpleGrid spacing={4} columns={5}>
                    <ResultCard imgPath="rectangle-3469580@2x.png" />
                    <ResultCard imgPath="rectangle-3469580@2x.png" />
                    <ResultCard imgPath="rectangle-3469580@2x.png" />
                    <ResultCard imgPath="rectangle-3469580@2x.png" />
                    <ResultCard imgPath="rectangle-3469580@2x.png" />
                    <ResultCard imgPath="rectangle-3469580@2x.png" />
                  </SimpleGrid>
                </TabPanel>
                <TabPanel>
                  <SimpleGrid spacing={4} columns={5}>
                    <ResultCard imgPath="rectangle-3469581@2x.png" />
                    <ResultCard imgPath="rectangle-3469581@2x.png" />
                    <ResultCard imgPath="rectangle-3469581@2x.png" />
                    <ResultCard imgPath="rectangle-3469581@2x.png" />
                    <ResultCard imgPath="rectangle-3469581@2x.png" />
                    <ResultCard imgPath="rectangle-3469581@2x.png" />
                  </SimpleGrid>
                </TabPanel>
                <TabPanel>
                  <SimpleGrid spacing={4} columns={5}>
                    <ResultCard imgPath="rectangle-3469582@2x.png" />
                    <ResultCard imgPath="rectangle-3469582@2x.png" />
                    <ResultCard imgPath="rectangle-3469582@2x.png" />
                    <ResultCard imgPath="rectangle-3469582@2x.png" />
                    <ResultCard imgPath="rectangle-3469582@2x.png" />
                    <ResultCard imgPath="rectangle-3469582@2x.png" />
                  </SimpleGrid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
          <Divider />
          <HStack justifyContent="space-between">
            <Checkbox size='sm' colorScheme='red'><Text>Select All Photos</Text></Checkbox>
            <ButtonGroup gap='1'>
              <Button aria-label='Cancel'
                size='sm'
                variant="outline"
                colorScheme='gray'
                borderRadius='1px'
              >Cancel</Button>
              <Button aria-label='Select Photos'
                size='sm'
                colorScheme='blue'
                borderRadius='1px'
              >Select Photos</Button>
            </ButtonGroup>
          </HStack>
        </VStack>
      </>
    </>
  );
};

export default FrameComponent1;
