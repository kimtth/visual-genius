import type { NextPage } from "next";
import { Card, CardBody, CardFooter, Divider, Heading, Text, Image, Stack, IconButton, HStack } from "@chakra-ui/react";
import { HiOutlineTrash } from "react-icons/hi";
import { LiaShareSquareSolid, LiaDownloadSolid } from "react-icons/lia";
import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import BasicModal from "../dialog/modal";
import { pathes } from "../state/pathes";
import { useDispatch } from "react-redux";
import { setCategoryData } from "../state/datas";
import { API_ENDPOINT } from "../state/const";
import useAxios from "axios-hooks";
import { downloadZip, executeShareUrl } from "../util/actionUtil";

const footerIconsLyaoutSytle = {
    justifyContent: 'flex-end'
}

interface CategoryCardProps {
    categoryId: string;
    item: any;
}

const CategoryCard: NextPage<CategoryCardProps> = ({ categoryId, item }) => {
    const { push } = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessageType, setModalMessageType] = useState("");
    const dispatch = useDispatch();

    const [{ data: downloadData, loading: downloadLoading, error: downloadError }, executeDownload] = useAxios(
        {
            url: `${API_ENDPOINT}/category/${categoryId}/download`,
            method: 'GET',
            responseType: 'blob'
        },
        { manual: true }
    )
    const [{ data: deleteData, loading: deleteLoading, error: deleteError }, executeDelete] = useAxios(
        {
            url: `${API_ENDPOINT}/category/${categoryId}/delete`,
            method: 'PUT'
        },
        { manual: true }
    )

    const onCategoryData = useCallback(
        (any: any) => dispatch(setCategoryData(any)),
        [dispatch]
    );

    useEffect(() => {
        downloadZip(downloadData);
    }, [downloadData]);

    const handleCategoryClick = (categoryId: string, categoryTitle: string) => {
        onCategoryData(item);
        push(`${pathes.gen}?categoryId=${categoryId}`);
    }

    const handleModal = (modalTitle: string, modalMessageType: string) => {
        setModalTitle(modalTitle);
        setModalMessageType(modalMessageType);
        setShowModal(true);
    }

    const handleCallback = () => {
        try {
            if (modalMessageType === 'delete') {
                executeDelete();
                alert('The category has been deleted.');
            } else if (modalMessageType === 'share') {
                executeShareUrl(categoryId);
            } else if (modalMessageType === 'download') {
                executeDownload();
                alert(deleteData);
            } else {
                console.log('The event is not supported.');
            }   
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            {showModal ?
                <>
                    <BasicModal key={"modal"}
                        open={showModal}
                        setOpen={setShowModal}
                        title={modalTitle}
                        messageType={modalMessageType}
                        callback={handleCallback}
                    />
                </> : null
            }
            <Card maxW='sm' key={categoryId}>
                <CardBody
                    onClick={() => handleCategoryClick(categoryId, item['title'])}
                >
                    <HStack height={'12vh'} spacing='4px'>
                        <Image
                            src={item['contentUrl'].length > 0 ? item['contentUrl'][0] : ''}
                            borderRadius='lg'
                            objectFit='cover'
                            boxSize='100px'
                            transform='rotate(10deg)'
                        />
                        <Image
                            src={item['contentUrl'].length > 1 ? item['contentUrl'][1] : ''}
                            borderRadius='lg'
                            objectFit='cover'
                            boxSize='100px'
                            transform='rotate(-10deg)'
                        />
                        <Image
                            src={item['contentUrl'].length > 2 ? item['contentUrl'][2] : ''}
                            borderRadius='lg'
                            objectFit='cover'
                            boxSize='100px'
                        />
                    </HStack>
                    <Stack mt='5' spacing='3'>
                        <Text
                            maxW={{ base: '100%', sm: '110px' }}
                            fontSize='xs'
                            paddingLeft='1px'
                            color='blue.400'
                            borderRadius='lg'
                            backgroundColor='blue.100'
                            textAlign="center"
                        >{item['category']}</Text>
                        <Heading size='sm' color='blue.400'>{item['title']}</Heading>
                        <Text fontSize='xs'>
                            {item['imgNum']} images | Difficulty {item['difficulty']}
                        </Text>
                    </Stack>
                </CardBody>
                <Divider />
                <CardFooter style={footerIconsLyaoutSytle}>
                    <IconButton aria-label='Delete'
                        variant="ghost"
                        colorScheme='red'
                        icon={<HiOutlineTrash />}
                        onClick={() => { handleModal('Delete', 'delete') }}
                    />
                    <IconButton aria-label='Share'
                        variant="ghost"
                        colorScheme='blue'
                        icon={<LiaShareSquareSolid />}
                        onClick={() => { handleModal('Share', 'share') }}
                    />
                    <IconButton aria-label='Download'
                        isLoading={downloadLoading}
                        variant="ghost"
                        colorScheme='blue'
                        icon={<LiaDownloadSolid />}
                        onClick={() => { handleModal('Download', 'download') }}
                    />
                </CardFooter>
            </Card>
        </>
    )
}

export default CategoryCard;