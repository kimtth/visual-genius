import type { NextPage } from "next";
import Header from "../../components/header/header";
import { Button, Text, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs, Box, VStack, Divider, HStack, ButtonGroup, IconButton } from "@chakra-ui/react";
import ResultCard from "../../components/imgcard/searchResultCard";
import { BiUpload } from "react-icons/bi";
import { HiChevronLeft } from "react-icons/hi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { API_ENDPOINT } from "../../components/state/const";
import useAxios from "axios-hooks";

const SelectPage: NextPage = () => {
  const { push, back } = useRouter();
  const [tabIndex, setTabIndex] = useState(0)
  const [emojiData, setEmojiData] = useState([]);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [checkedEmojiItems, setCheckedEmojiItems] = useState<string[]>([]);

  const categoryData = useSelector((state: any) => state.datas.CategoryData);
  const searchDataPayload = useSelector((state: any) => state.datas.SearchResultPayload);

  const [{ data, loading, error }, getData] = useAxios(
    `${API_ENDPOINT}/emojies`
  );
  const [{ data: postData, loading: postLoading, error: postError }, executePost] = useAxios(
    {
      url: `${API_ENDPOINT}/images`,
      method: 'POST'
    },
    { manual: true }
  )

  useEffect(() => {
    if (data) {
      setEmojiData(data);
    }
  }, [data]);

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
            checkedItems.includes(item['id'])).map((item: any) =>
            ({
              id: item['id'],
              categoryId: categoryData['id'],
              title: item['title'],
              imgPath: item['imgPath']
            }));
          executePost({
            data: transformedDataPayload
          })
          if(postData) {
            alert("Added successfully!")
          }
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
            checkedEmojiItems.includes(item['id'])).map((item: any) =>
            ({
              id: item['id'],
              categoryId: categoryData['id'],
              title: item['title'],
              imgPath: item['imgPath']
            }));
          executePost({
            data: transformedEmojiData
          })
          if(postData) {
            alert("Added successfully!")
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        alert("Please select at least one photo!");
      }
    }
  }

  const handleSearchResultSelectItem = (id: string, checked: boolean) => {
    const newCheckedItems =
      checked ? [...checkedItems, id] : checkedItems.filter((itemId) => itemId !== id);
    setCheckedItems(newCheckedItems);
  };

  const handleEmojiSelectItem = (id: string, checked: boolean) => {
    const newCheckedItems =
      checked ? [...checkedEmojiItems, id] : checkedEmojiItems.filter((itemId) => itemId !== id);
    setCheckedEmojiItems(newCheckedItems);
  };

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
              <Button aria-label='Upload'
                leftIcon={<BiUpload />}
                size='sm'
                variant="outline"
                colorScheme='gray'
                borderRadius='1px'
                onClick={() => { alert("Under construction!") }}
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
                            key={item['id']}
                            title={item['title']}
                            imgPath={item['imgPath']}
                            checked={checkedItems.includes(item['id'])}
                            onSelect={(checked: boolean) => { handleSearchResultSelectItem(item['id'], checked) }}
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
                            key={item['id']}
                            title={item['title']}
                            imgPath={item['imgPath']}
                            checked={checkedEmojiItems.includes(item['id'])}
                            onSelect={(checked: boolean) => { handleEmojiSelectItem(item['id'], checked) }}
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
