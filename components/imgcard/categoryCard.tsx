import type { NextPage } from "next";
import { Card, CardBody, CardFooter, Divider, Heading, Text, Image, Stack, IconButton, HStack } from "@chakra-ui/react";
import { HiOutlineTrash } from "react-icons/hi";
import { LiaShareSquareSolid, LiaDownloadSolid, LiaPrintSolid } from "react-icons/lia";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BasicModal from "../dialog/modal";
import { pathes } from "../state/pathes";

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

    const handleModal = (modalTitle: string, modalMessageType: string) => {
        setModalTitle(modalTitle);
        setModalMessageType(modalMessageType);
        setShowModal(true);
    }

    return (
        <>
            {showModal ?
                <>
                    <BasicModal key={"modal"} open={showModal} setOpen={setShowModal} title={modalTitle} messageType={modalMessageType} />
                </> : null
            }
            <Card maxW='sm' key={categoryId}>
                <CardBody
                    onClick={() => push(`${pathes.gen}?categoryId=${categoryId}`)}
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
                        variant="ghost"
                        colorScheme='blue'
                        icon={<LiaDownloadSolid />}
                        onClick={() => { handleModal('Download', 'download') }}
                    />
                    <IconButton aria-label='Print'
                        variant="ghost"
                        colorScheme='blue'
                        icon={<LiaPrintSolid />}
                        onClick={() => { handleModal('Print', 'print') }}
                    />
                </CardFooter>
            </Card>
        </>
    )
}

export default CategoryCard;