// @ts-nocheck
import React, { useCallback, useEffect, useState, MouseEvent } from "react";
import useAxios from "axios-hooks";
import { useRouter } from "next/router";
import { Paginator, Container, PageGroup, usePaginator } from "chakra-paginator";
import { Box, Button, Center, SimpleGrid, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useSelector, useDispatch } from "react-redux";
import { setCategoriesDataPayload } from "../../components/state/datas";
import { IoCreate } from "react-icons/io5";
import '../../components/util/axiosInterceptor';
import { API_ENDPOINT } from "../../components/state/const";
import Header from "../../components/header/header";
import CategoryCard from "../../components/imgcard/categoryCard";


const newBtnStyles = {
  display: 'flex',
  borderRadius: '8px',
  width: '100%',
  paddingTop: '20px',
  paddingRight: '15vw',
  paddingBottom: '20px',
  justifyContent: 'right',
}

const footerStyles = {
  position: 'absolute',
  width: '100%',
  height: '20px',
  justifyContent: 'center'
}


const Home = () => {
  const { push, refresh } = useRouter();
  const itemCountPerPage = 6;
  const [pageNum, setPageNum] = useState(1);
  const { currentPage, setCurrentPage } = usePaginator({
    initialState: { currentPage: 1 }
  });
  const [{ data: cntData, loading: cntloading, error: cntError }, cntrefetch] = useAxios(`${API_ENDPOINT}/categories/count`, { manual: true, autoCancel: false });
  const [{ data, loading, error }, refetch] = useAxios(`${API_ENDPOINT}/categories?page=${pageNum}&per_page=6`, { manual: true, autoCancel: false });
  const categoriesData = useSelector((state: any) => state.datas.CategoriesDataPayload);
  const dispatch = useDispatch();

  const onDataPayload = useCallback(
    (any: any) => dispatch(setCategoriesDataPayload(any)),
    [dispatch]
  );

  useEffect(() => {
    handleFetch();
  }, []);

  useEffect(() => {
    if (cntData) {
      setPageNum(Math.ceil(parseInt(cntData['count']) / itemCountPerPage));
    }
  }, [cntData]);

  useEffect(() => {
    if (data) {
      onDataPayload(data);
    }
  }, [data]);

  const handleFetch = () => {
    try {
      refetch();
      cntrefetch();
    } catch (error) {
      alert(error);
      console.error(error);
    }
  }

  const handleNewCategory = (e: MouseEvent<HTMLButtonElement>) => {
    push('/gen');
  }

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    handleFetch();
  }

  const baseStyles = {
    w: 4,
    h: 5
  };

  const normalStyles = {
    ...baseStyles,
    bg: "white"
  };

  const activeStyles = {
    ...baseStyles,
    bg: "blue.100",
    borderRadius: "5px"
  };

  if (error) return <p>Error!</p>;

  return (
    <div>
      <Box position="sticky" w="100%" top="0" zIndex="20">
        <Header />
      </Box>
      <Box position="sticky"
        style={newBtnStyles}>
        <Button
          aria-label="New"
          colorScheme="twitter"
          size="sm"
          leftIcon={<IoCreate />}
          onClick={e => handleNewCategory(e)}
        >
          New
        </Button>
      </Box>
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
                      <CategoryCard key={item['sid']} categoryId={item['sid']} item={item} />
                    )
                  }
                  ) : ""
                }
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Center>
      <Box>
        {/* Add the Paginator component here */}
        <Paginator
          pagesQuantity={pageNum}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          normalStyles={normalStyles}
          activeStyles={activeStyles}
        >
          <Container align="center" w="full" p={4} style={footerStyles}>
            <PageGroup align="center" />
          </Container>
        </Paginator>
      </Box>
    </div>
  );
};

export default Home;
