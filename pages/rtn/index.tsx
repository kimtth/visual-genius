import type { NextPage } from "next";
import Header from "../../components/header/header";
import { Button, Text, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs, Box, VStack, Divider, Checkbox, HStack, ButtonGroup, IconButton } from "@chakra-ui/react";
import ResultCard from "../../components/imgcard/searchResultCard";
import { BiUpload } from "react-icons/bi";
import { HiChevronLeft } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { pathes } from "../../components/state/pathes";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const SelectPage: NextPage = () => {
  const { push } = useRouter();
  const [selectAll, setSelectAll] = useState(false);
  const dataPayload = useSelector((state: any) => state.datas.SearchResultPayload);

  return (
    <>
      <Box position="sticky" w="100%" top="0" zIndex="20">
        <Header />
      </Box>
      <>
        <VStack position={'absolute'} top={'8vh'} left={'20px'} padding={'5px'} alignItems="left">
          <Box display="flex" alignItems="center">
            <IconButton aria-label='Back to Home'
              variant="ghost"
              colorScheme='gray'
              icon={<HiChevronLeft />}
              onClick={() => { push(pathes.gen) }}
            />
            <Text fontWeight='bold' fontSize='md'>Back to Edit</Text>
          </Box>
          <HStack justifyContent="space-between">
            <Checkbox
              size='sm'
              colorScheme='red'
              onChange={() => { setSelectAll(!selectAll) }}
            >
              <Text>Select All Photos</Text>
            </Checkbox>
            <ButtonGroup gap='1'>
              {/* <Button aria-label='Cancel'
                size='sm'
                variant="outline"
                colorScheme='gray'
                borderRadius='1px'
                onClick={() => { push(pathes.gen) }}
              >Cancel</Button> */}
              <Button aria-label='Add Photos'
                size='sm'
                colorScheme='blue'
                borderRadius='1px'
                onClick={() => { push(pathes.gen) }}
              >Add Photos</Button>
              <Button aria-label='Upload'
                leftIcon={<BiUpload />}
                size='sm'
                variant="outline"
                colorScheme='gray'
                borderRadius='1px'
              >Upload My own photos</Button>
            </ButtonGroup>
          </HStack>
          <Box>
            <Tabs defaultIndex={0} width={'68vw'}>
              <TabList>
                <Tab width="20vw">Search Result</Tab>
                <Tab width="20vw">Emojis</Tab>
              </TabList>
              <TabPanels height={'72vh'}>
                <TabPanel>
                  <SimpleGrid spacing={4} columns={5}>
                    {
                      dataPayload.map((item: any, index: any) => {
                        return (
                          <ResultCard key={item['id']} title={item['title']} imgPath={item['imgPath']} selectAll={selectAll} />
                        )
                      }
                      )
                    }
                  </SimpleGrid>
                </TabPanel>
                <TabPanel>
                  <SimpleGrid spacing={4} columns={5}>
                    <ResultCard title={''} imgPath="rectangle-3469581@2x.png" selectAll={selectAll} />
                    <ResultCard title={''} imgPath="rectangle-3469581@2x.png" selectAll={selectAll} />
                    <ResultCard title={''} imgPath="rectangle-3469581@2x.png" selectAll={selectAll} />
                    <ResultCard title={''} imgPath="rectangle-3469581@2x.png" selectAll={selectAll} />
                    <ResultCard title={''} imgPath="rectangle-3469581@2x.png" selectAll={selectAll} />
                    <ResultCard title={''} imgPath="rectangle-3469581@2x.png" selectAll={selectAll} />
                  </SimpleGrid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
          <Divider />

        </VStack>
      </>
    </>
  );
};

export default SelectPage;
