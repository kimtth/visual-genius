import Header from "../../components/header/header";
import NewSidePanel from "../../components/sidepanel/sidepanel";
import DragDropBoard from "../../components/dnd";
import React, { useCallback, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import Axios from "axios";
import '../../components/util/axiosInterceptor';
import { API_ENDPOINT } from "../../components/state/const";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setImageDataPayload } from "../../components/state/datas";
import { setColumnNumber, setImageNumber, setRowNumber } from "../../components/state/settings";
import { arrangeDataToColumns } from "../../components/data/dataHandler";


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


const NewPage = () => {
  const router = useRouter()
  const [categoryIdstate, setCategoryId] = React.useState("");
  const [disableGenButton, setDisableGenButton] = React.useState(false);

  const dataPayload = useSelector((state: any) => state.datas.ImageDataPayload);
  const columnNumber = useSelector((state: any) => state.settings.setColumnNumber);
  const dispatch = useDispatch();

  const onSetImageNumber = useCallback(
    (any: any) => dispatch(setImageNumber(any)),
    [dispatch]
  );
  const onSetRowNumber = useCallback(
    (any: any) => dispatch(setRowNumber(any)),
    [dispatch]
  );
  const onSetColumnNumber = useCallback(
    (any: any) => dispatch(setColumnNumber(any)),
    [dispatch]
  );

  const onDataPayload = useCallback(
    (any: any) => dispatch(setImageDataPayload(any)),
    [dispatch]
  );

  const onSetImageColRowNumber = (totalImgNum: number, rowNum: number, columnNumber: number) => {
    onSetImageNumber(totalImgNum > 0 ? totalImgNum : 1);
    onSetRowNumber(rowNum > 0 ? rowNum : 1);
    onSetColumnNumber(columnNumber > 0 ? columnNumber : 5);
    //console.log(totalImgNum, rowNum, columnNumber);
  }

  useEffect(() => {
    if (categoryIdstate) {
      Axios.get(`${API_ENDPOINT}/images/${categoryIdstate}`).then((result: any) => {
        const data = result.data;
        if (data && Object.keys(data).length !== 0) {
          const arrangedData = arrangeDataToColumns(data, columnNumber,
            // callback function
            (totalImgNum: number, rowNum: number, columnNumber: number) => {
              onSetImageColRowNumber(totalImgNum, rowNum, columnNumber)
            }
          );
          //console.log(arrangedData);
          onDataPayload(arrangedData);
          setDisableGenButton(true);
        }
      }).catch((error: any) => {
        console.log(error);
      });
    } else {
      onDataPayload(null);
      setDisableGenButton(false);
      onSetImageColRowNumber(0, 0, 0);
    }
  }, [categoryIdstate]);

  useEffect(() => {
    if (router.isReady) {
      const { categoryId } = router.query;
      const categoryIdStr = categoryId as string;
      setCategoryId(categoryIdStr);
    }
  }, [router.isReady, router.query]);

  return (
    <>
      <Box position="sticky" w="100%" top="0" zIndex="20">
        <Header />
      </Box>
      <Box minHeight="100vh" overflow="auto" zIndex="10" display='flex'>
        <div style={{ width: '20vw' }}>
          <NewSidePanel disableGenButton={disableGenButton} setDisableGenButton={setDisableGenButton}/>
        </div>
        <div style={{ width: '80vw' }}>
          {dataPayload != null ?
            // display='flex'
            // justifyContent='center' -> vertical direction
            // alignItems='center' -> horizontal direction
            // https://qiita.com/piyonakajima/items/1b48a42a7a6e44bc57c9
            <Box display='flex'
              justifyContent='center'
              alignItems='center'
              mt="3vh"
            >
              <DragDropBoard dataPayload={dataPayload} />
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
        </div>
      </Box>
    </>
  );
};

export default NewPage;

