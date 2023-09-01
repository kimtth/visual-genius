import type { NextPage } from "next";
import Header from "../../components/header/header";
import NewSidePanel from "../../components/sidepanel/sidepanel";
import DragDropBoard from "../../components/dnd";

import React, { useCallback, useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import useAxios from "axios-hooks";
import { API_ENDPOINT } from "../../components/state/const";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setImageDataPayload } from "../../components/state/datas";
import { v4 as uuidv4 } from 'uuid';
import { DataFromBackend } from "../../components/state/type";
import { setColumnNumber, setImageNumber, setRowNumber, showImgCaption } from "../../components/state/settings";

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



const NewPage: NextPage = () => {
  const router = useRouter()
  const { categoryId } = router.query
  const [{ data, loading, error }] = useAxios(
    `${API_ENDPOINT}/images/${categoryId}`
  );
  const dataPayload = useSelector((state: any) => state.datas.ImageDataPayload);
  const imageNumber = useSelector((state: any) => state.settings.setImageNumber);
  const rowNumber = useSelector((state: any) => state.settings.setRowNumber);
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

  const arrangeDataToColumns = (data: any) => {
    const prematureImgs = data.length > 0 ? data : [];
    // Draggable requires a [string] draggableId.
    const imgs = prematureImgs.map((img: any) => {
      img.id = img.id.toString();
      return img;
    });

    const totalImgNum = Object.keys(imgs).length;
    const rowNum = Math.ceil(totalImgNum / columnNumber);
    console.log(totalImgNum, columnNumber, rowNum);

    onSetImageNumber(totalImgNum);
    onSetRowNumber(rowNum);
    onSetColumnNumber(columnNumber);

    const dataFromBackend: DataFromBackend = {};
    for (let i = 0; i < columnNumber; i++) {
      dataFromBackend[uuidv4()] = {
        items: imgs.slice(i * rowNum, (i + 1) * rowNum),
      }
    }
    return dataFromBackend;
  }

  useEffect(() => {
    if (data) {
      const arrangedData = arrangeDataToColumns(data);
      onDataPayload(arrangedData);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;

  return (
    <>
      <Box position="sticky" w="100%" top="0" zIndex="20">
        <Header />
      </Box>
      <Box minHeight="100vh" overflow="auto" zIndex="10" display='flex'>
        <div style={{ width: '20vw' }}>
          <NewSidePanel />
        </div>
        <div style={{ width: '80vw' }}>
          {dataPayload ?
            // display='flex'
            // justifyContent='center' -> vertical direction
            // alignItems='center' -> horizontal direction
            // https://qiita.com/piyonakajima/items/1b48a42a7a6e44bc57c9
            <Box display='flex' justifyContent='center' alignItems='center' mt="3vh">
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

