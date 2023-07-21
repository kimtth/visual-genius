import type { NextPage } from "next";
import { Card, CardBody, CardFooter, Divider, Heading, Text, Image, Stack, IconButton, HStack, Checkbox, Box, Flex, Spacer } from "@chakra-ui/react";
import { HiOutlineTrash } from "react-icons/hi";
import { LiaShareSquareSolid, LiaDownloadSolid, LiaPrintSolid } from "react-icons/lia";

interface PhotoProps {
    imgPath: string;
}

const PhotoCard: NextPage<PhotoProps> = ({ imgPath }) => {

    return (
        <div>
            <Card maxW='sm' >
                <CardBody>
                    <Flex>
                        <Checkbox size='sm' colorScheme='green' />
                        <Spacer/>
                        <Image
                            src={imgPath ? imgPath : "-"}
                            borderRadius='lg'
                            objectFit='cover'
                            maxW={{ sm: '10vw' }}
                        />
                    </Flex>
                </CardBody>
            </Card>
        </div>
    )
}

export default PhotoCard;