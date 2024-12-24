
import { FC, useEffect, useCallback, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import useAxios from "axios-hooks";
import BasicModal from "./basicMessageModal";
import { pathes } from "../state/pathes";
import { setCategoriesDataPayload, setCategoryData } from "../state/datas";
import { API_ENDPOINT } from "../state/const";
import '../util/axiosInterceptor';
import { downloadZip, executeShareUrl } from "../util/actionUtil";
import { Card, CardBody, CardFooter, Divider, Heading, Text, Image, Stack, IconButton, HStack, Link } from "@chakra-ui/react";
import { HiOutlineTrash } from "react-icons/hi";
import { LiaShareSquareSolid, LiaDownloadSolid } from "react-icons/lia";
import NextLink from 'next/link';

const footerIconsLyaoutSytle = {
    justifyContent: 'flex-end'
}

interface CategoryCardProps {
    categoryId: string;
    item: any;
}

interface CategoryCardProps {
    categoryId: string;
    item: any;
}

const CategoryCard: FC<CategoryCardProps> = ({ categoryId, item }) => {
    const { push } = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessageType, setModalMessageType] = useState("");
    const [popupAlertMessage, setPopupAlertMessage] = useState("");
    const categoriesData = useSelector((state: any) => state.datas.CategoriesDataPayload);
    const dispatch = useDispatch();

    const [{ data: downloadData, loading: downloadLoading, error: downloadError }, executeDownload] = useAxios(
        {
            url: `${API_ENDPOINT}/category/${categoryId}/download`,
            method: 'GET',
            responseType: 'blob'
        },
        { manual: true, autoCancel: false }
    )
    const [{ data: deleteData, loading: deleteLoading, error: deleteError }, executeDelete] = useAxios(
        {
            url: `${API_ENDPOINT}/category/${categoryId}/delete`,
            method: 'PUT'
        },
        { manual: true, autoCancel: false }
    )

    const onCategoryData = useCallback(
        (any: any) => dispatch(setCategoryData(any)),
        [dispatch]
    );

    const onCategoriesDataPayload = useCallback(
        (any: any) => dispatch(setCategoriesDataPayload(any)),
        [dispatch]
    );

    useEffect(() => {
        downloadZip(downloadData);
    }, [downloadData]);

    useEffect(() => {
        if (deleteData?.message) {
            alert(deleteData.message);
            const newCategoriesData = categoriesData.filter((item: any) => item.categoryId !== deleteData.categoryId);
            onCategoriesDataPayload(newCategoriesData);
        }
    }, [deleteData]);

    const handleCategoryClick = (categoryId: string) => {
        onCategoryData(item);
        push(`${pathes.gen}?categoryId=${categoryId}`);
    }

    const handleModal = (modalTitle: string, modalMessageType: string) => {
        setModalTitle(modalTitle);
        setModalMessageType(modalMessageType);
        setShowModal(true);
    }

    const handleDelete = async () => {
        let alertMessage = '';
        if (categoryId) {
            const msg = await executeDelete();
            alertMessage = msg.data.message;
            if (alertMessage) {
                window.location.reload();
            }
        } else {
            alertMessage = 'Please save the category first.';
        }
        return alertMessage;
    }

    const handleShare = () => {
        let alertMessage = '';
        if (categoryId) {
            executeShareUrl(categoryId);
            alertMessage = 'The url has been copied to your clipboard.';
        } else {
            alertMessage = 'Please save the category first.';
        }
        return alertMessage;
    }

    const handleDownload = () => {
        let alertMessage = '';
        if (categoryId) {
            executeDownload();
        } else {
            alertMessage = 'Please save the category first.';
        }
        return alertMessage;
    }

    const handleCallback = async () => {
        try {
            let alertMessage = '';

            switch (modalMessageType) {
                case 'delete':
                    alertMessage = await handleDelete();
                    break;
                case 'share':
                    alertMessage = handleShare();
                    break;
                case 'download':
                    alertMessage = handleDownload();
                    break;
                default:
                    console.log('The event is not supported.');
            }

            if (alertMessage) {
                alert(alertMessage);
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
                    backgroundColor={'aliceblue'}
                >
                    <HStack
                        height={'12vh'}
                        spacing={'4px'}
                        onClick={() => handleCategoryClick(categoryId)}
                    >
                        {item['contentUrl'].length > 0 ?
                            <Image
                                src={item['contentUrl'][0]}
                                borderRadius='lg'
                                h='80%'
                                w='30%'
                                objectFit={'cover'}
                                transform='rotate(10deg)'
                            /> : ''}
                        {item['contentUrl'].length > 1 ?
                            <Image
                                src={item['contentUrl'][1]}
                                borderRadius='lg'
                                h='80%'
                                w='38%'
                                objectFit={'cover'}
                                transform='rotate(-10deg)'
                            /> : ''}
                        {item['contentUrl'].length > 2 ?
                            <Image
                                src={item['contentUrl'][2]}
                                borderRadius='lg'
                                h='80%'
                                w='30%'
                                objectFit={'cover'}
                            /> : ''}
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
                        >{item['topic']}</Text>
                        <Heading size='sm' color='blue.400'><Link as={NextLink} href={`${pathes.gen}?categoryId=${categoryId}`}>{item['title']}</Link></Heading>
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