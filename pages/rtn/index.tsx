import type { NextPage } from "next";
import Header from "../../components/header/header";
import { Button, Text, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs, Box, VStack, Divider, HStack, ButtonGroup, IconButton } from "@chakra-ui/react";
import ResultCard from "../../components/imgcard/searchResultCard";
import { BiUpload } from "react-icons/bi";
import { HiChevronLeft } from "react-icons/hi";
import { useRouter } from "next/router";
import { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { API_ENDPOINT } from "../../components/state/const";
import useAxios from "axios-hooks";
//!important: use useAxios with { manual:true, autoCancel: false } to prevent infinite request loop and cancel requests during a server processing.

const SelectPage: NextPage = () => {
  const { back } = useRouter();
  const [tabIndex, setTabIndex] = useState(0)
  const [emojiData, setEmojiData] = useState([]);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checkedEmojiItems, setCheckedEmojiItems] = useState<string[]>([]);

  const categoryData = useSelector((state: any) => state.datas.CategoryData);
  const searchDataPayload = useSelector((state: any) => state.datas.SearchResultPayload);

  const [{ data, loading, error }, getData] = useAxios(
    `${API_ENDPOINT}/emojies`,
    { manual: true, autoCancel: false }
  );
  const [{ data: postData, loading: postLoading, error: postError }, executePost] = useAxios(
    {
      url: `${API_ENDPOINT}/images`,
      method: 'POST'
    },
    { manual: true, autoCancel: false }
  )

  useEffect(() => {
    if (data) {
      setEmojiData(data);
    }
  }, [data]);

  useEffect(() => {
    if (tabIndex == 1) {
      getData();
    }
  }, [tabIndex]);

  useEffect(() => {
    if (postData) {
      console.log(postData);
      alert("Added successfully!")
    }
  }, [postData]);

  const handleTabsChange = (index: number) => {
    setTabIndex(index)
  }

  const handleBackToEdit = () => {
    back();
  }

  const handleAddPhotos = () => {
    if (tabIndex == 0) {
      if (checkedItems.length > 0) {
        try {
          const transformedDataPayload = searchDataPayload.filter((item: any) =>
            checkedItems.includes(item['sid'])).map((item: any) =>
            ({
              sid: item['sid'],
              categoryId: categoryData['sid'],
              title: item['title'],
              imgPath: item['imgPath']
            }));
          executePost({
            data: transformedDataPayload
          })
        } catch (error) {
          console.error(error);
        }
      } else {
        alert("Please select at least one photo!");
      }
    } else if (tabIndex == 1) {
      if (checkedEmojiItems.length > 0) {
        try {
          const transformedEmojiData = emojiData.filter((item: any) =>
            checkedEmojiItems.includes(item['sid'])).map((item: any) =>
            ({
              sid: item['sid'],
              categoryId: categoryData['sid'],
              title: item['title'],
              imgPath: item['imgPath']
            }));
          executePost({
            data: transformedEmojiData
          })
        } catch (error) {
          console.error(error);
        }
      } else {
        alert("Please select at least one photo!");
      }
    }
  }

  const handleSearchResultSelectItem = (sid: string, checked: boolean) => {
    const newCheckedItems =
      checked ? [...checkedItems, sid] : checkedItems.filter((itemId) => itemId !== sid);
    setCheckedItems(newCheckedItems);
  };

  const handleEmojiSelectItem = (sid: string, checked: boolean) => {
    const newCheckedItems =
      checked ? [...checkedEmojiItems, sid] : checkedEmojiItems.filter((itemId) => itemId !== sid);
    setCheckedEmojiItems(newCheckedItems);
  };

  // Mutiple file upload
  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        console.log(`Selected file: ${files[i].name}`);
      }
    }
  }

  const handleFileClick = (e: MouseEvent<HTMLButtonElement>) => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  }

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
              onClick={() => { handleBackToEdit() }}
            />
            <Text fontWeight='bold' fontSize='md'>Back</Text>
          </Box>
          <HStack justifyContent="right">
            <ButtonGroup gap='1'>
              <Button aria-label='Add Photos'
                size='sm'
                colorScheme='blue'
                borderRadius='1px'
                isLoading={postLoading}
                onClick={() => { handleAddPhotos() }}
              >Add Photos</Button>
              <input type='file' id='fileInput' style={{ display: 'none' }} onChange={handleFileUpload} multiple />
              <Button aria-label='Upload'
                leftIcon={<BiUpload />}
                size='sm'
                variant="outline"
                colorScheme='gray'
                borderRadius='1px'
                onClick={handleFileClick}
              >Upload My own photos</Button>
            </ButtonGroup>
          </HStack>
          <Box>
            <Tabs defaultIndex={0} width={'68vw'} onChange={handleTabsChange}>
              <TabList>
                <Tab width="20vw">Search Result</Tab>
                <Tab width="20vw">Emojis</Tab>
              </TabList>
              <TabPanels height={'72vh'}>
                <TabPanel>
                  <SimpleGrid spacing={4} columns={5}>
                    {
                      searchDataPayload.map((item: any, index: any) => {
                        return (
                          <ResultCard
                            key={item['sid']}
                            title={item['title']}
                            imgPath={item['imgPath']}
                            checked={checkedItems.includes(item['sid'])}
                            onSelect={(checked: boolean) => { handleSearchResultSelectItem(item['sid'], checked) }}
                          />
                        )
                      }
                      )
                    }
                  </SimpleGrid>
                </TabPanel>
                <TabPanel>
                  <SimpleGrid spacing={4} columns={5}>
                    {
                      emojiData.map((item: any, index: any) => {
                        return (
                          <ResultCard
                            key={item['sid']}
                            title={item['title']}
                            imgPath={item['imgPath']}
                            checked={checkedEmojiItems.includes(item['sid'])}
                            onSelect={(checked: boolean) => { handleEmojiSelectItem(item['sid'], checked) }}
                          />
                        )
                      }
                      )
                    }
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
