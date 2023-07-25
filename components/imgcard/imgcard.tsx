import type { NextPage } from "next";
import { Card, CardBody, CardFooter, Divider, Heading, Text, Image, Stack, IconButton, HStack } from "@chakra-ui/react";
import { HiOutlineTrash } from "react-icons/hi";
import { LiaShareSquareSolid, LiaDownloadSolid, LiaPrintSolid } from "react-icons/lia";

const ImageCard: NextPage = (item, index) => {

    const footerIconsLyaoutSytle = {
        justifyContent: 'flex-end'
    }

    return (
        <div>
            <Card maxW='sm'>
                <CardBody>
                    <HStack spacing='4px'>
                        <Image
                            src='./avatarimage1@2x.png'
                            borderRadius='lg'
                            objectFit='cover'
                            maxW={{ base: '80%', sm: '110px' }}
                            transform='rotate(16deg)'
                        />
                        <Image
                            src='./avatarimage4@2x.png'
                            borderRadius='lg'
                            objectFit='cover'
                            maxW={{ base: '80%', sm: '110px' }}
                        />
                        <Image
                            src='./avatarimage8@2x.png'
                            borderRadius='lg'
                            objectFit='cover'
                            maxW={{ base: '80%', sm: '110px' }}
                            transform='rotate(10deg)'
                        />
                    </HStack>
                    <Stack mt='6' spacing='3'>
                        <Text
                            maxW={{ base: '100%', sm: '110px' }}
                            fontSize='xs'
                            paddingLeft='1px'
                            color='blue.400'
                            borderRadius='lg'
                            backgroundColor='blue.100'
                            textAlign="center"
                        >Pattern Recognition</Text>
                        <Heading size='sm' color='blue.400'>Our feelings</Heading>
                        <Text fontSize='xs'>
                            6 images | Difficulty 3
                        </Text>
                    </Stack>
                </CardBody>
                <Divider />
                <CardFooter style={footerIconsLyaoutSytle}>
                    <IconButton aria-label='Delete'
                        variant="ghost"
                        colorScheme='red'
                        icon={<HiOutlineTrash />} />
                    <IconButton aria-label='Share'
                        variant="ghost"
                        colorScheme='blue'
                        icon={<LiaShareSquareSolid />} />
                    <IconButton aria-label='Download'
                        variant="ghost"
                        colorScheme='blue'
                        icon={<LiaDownloadSolid />} />
                    <IconButton aria-label='Print'
                        variant="ghost"
                        colorScheme='blue'
                        icon={<LiaPrintSolid />} />
                </CardFooter>
            </Card>
        </div>
    )
}

export default ImageCard;