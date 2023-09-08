import type { NextPage } from "next";
import Header from "../../components/header/header";
import CategoryCard from "../../components/imgcard/categoryCard";
import { Box, Button, Center, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useSelector, useDispatch } from "react-redux";
import { setCategoriesDataPayload } from "../../components/state/datas";
import React, { useCallback, useEffect, MouseEvent, use } from "react";
import useAxios from "axios-hooks";
import { IoCreate } from "react-icons/io5";
import { API_ENDPOINT } from "../../components/state/const";
import { useRouter } from "next/navigation";

const kbStyles = {
  display: 'flex',
  borderRadius: '8px',
  paddingTop: '2%',
  justifyContent: 'right',
  margin: 'auto 15vw auto',
}

const Home: NextPage = () => {
  const { push, refresh } = useRouter();
  const [{ data, loading, error }, refetch] = useAxios(
    `${API_ENDPOINT}/categories`
  );
  const categoriesData = useSelector((state: any) => state.datas.CategoriesDataPayload);
  const dispatch = useDispatch();

  const onDataPayload = useCallback(
    (any: any) => dispatch(setCategoriesDataPayload(any)),
    [dispatch]
  );

  useEffect(() => {
    if (data) {
      onDataPayload(data);
    }
  }, [data]);

  const handleNewCategory = (e: MouseEvent<HTMLButtonElement>) => {
    push('/gen');
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

  return (
    <div>
      <Box position="sticky" w="100%" top="0" zIndex="20">
        <Header />
      </Box>
      <Center style={kbStyles}>
        <Button
          aria-label="New"
          colorScheme="twitter"
          size="sm"
          leftIcon={<IoCreate />}
          onClick={e => handleNewCategory(e)}
        >
          New
        </Button>
      </Center>
      <Center>
        <Tabs>
          <TabList>
            <Tab>Topics</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={3} spacingX='30px' spacingY='10px'>
                {
                  categoriesData ? categoriesData.map((item: any, index: any) => {
                    return (
                      <CategoryCard key={item['id']} categoryId={item['id']} item={item} />
                    )
                  }
                  ) : ""
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
