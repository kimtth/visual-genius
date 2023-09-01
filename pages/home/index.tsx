import type { NextPage } from "next";
import Header from "../../components/header/header";
import CategoryCard from "../../components/imgcard/categoryCard";
import { Box, Center, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useSelector, useDispatch } from "react-redux";
import { setCategoryDataPayload } from "../../components/state/datas";
import React, { useCallback, useEffect } from "react";
import useAxios from "axios-hooks";
import { API_ENDPOINT } from "../../components/state/const";
import { setColumnNumber, setImageNumber, showImgCaption } from "../../components/state/settings";

const kbStyles = {
  paddingTop: '5%'
}

const Home: NextPage = () => {
  const [{ data, loading, error }] = useAxios(
    `${API_ENDPOINT}/categories`
  );
  const categoryData = useSelector((state: any) => state.datas.CategoryDataPayload);
  const dispatch = useDispatch();

  const onDataPayload = useCallback(
    (any: any) => dispatch(setCategoryDataPayload(any)),
    [dispatch]
  );

  useEffect(() => {
    if (data) {
      onDataPayload(data);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

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
                  categoryData.map((item: any, index: any) => {
                    return (
                      <CategoryCard key={item['id']} categoryId={item['id']} item={item} />
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
