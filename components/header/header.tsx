import type { NextPage } from "next";
import { HStack, Box, Text, Input, InputGroup, Image, InputRightElement, Icon, IconButton } from "@chakra-ui/react";
import { SiMicrosoftbing } from 'react-icons/si';
import { FiSearch } from "react-icons/fi";
import { useCallback, useEffect, useState } from "react";
import { pathes } from "../../components/state/pathes";
import { API_ENDPOINT } from "../state/const";
import useAxios from "axios-hooks";
import { MouseEvent, KeyboardEvent } from "react";
import { useDispatch } from "react-redux";
import { setSearchResultPayload } from "../state/datas";
import { useRouter } from "next/router";


const Header: NextPage = () => {
    const { push } = useRouter();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchTriggerd, setSearchTriggered] = useState(false);
    const [{ data, loading, error }, refetch] = useAxios({
        url: `${API_ENDPOINT}/search/${searchKeyword}?count=5`,
        method: 'GET'
    }, { manual: true, autoCancel: false }
    );

    const dispatch = useDispatch();
    const onDataPayload = useCallback(
        (any: any) => dispatch(setSearchResultPayload(any)),
        [dispatch]
    );

    useEffect(() => {
        if (data) {
            onDataPayload(data);
            setSearchTriggered(false);
            push(pathes.rtn);
            //window.location.href= `${pathes.rtn}`;
        }
    }, [data]);

    const handleSearchClick = (e: MouseEvent) => {
        e.preventDefault();
        handleSearch();
    }

    const handleSearchInput = (e: KeyboardEvent) => {
        if (e.key == 'Enter') {
            handleSearch();
        }
    }

    const handleSearch = () => {
        if (!searchKeyword) {
            alert("Search Keyword cannot be empty!");
        } else {
            try {
                refetch();
            } catch (error) {
                alert(error);
                console.error(error);
            } finally {
                setSearchTriggered(true);
            }
        }
    }

    // if (loading) return <p>Loading...</p>;
    if (error) return <p>Error!</p>;

    return (
        <>
            <HStack justifyContent='space-between' width={'100%'} height={'49px'} backgroundColor={'var(--comm-blue-primary-0078d4)'}>
                <Box display="flex" alignItems="center" p={4} >
                    <Icon as={SiMicrosoftbing} w={5} h={5} color='white' />
                    <Text fontWeight='bold' color="white">Visual Genius: Communication Assistant</Text>
                </Box>
                <Box>
                    <InputGroup size='sm'>
                        <Input
                            bg='white'
                            color='gray'
                            variant="outline"
                            placeholder="Search"
                            size='sm'
                            width={'35vw'}
                            value={searchKeyword}
                            onChange={(e) => { setSearchKeyword(e.target.value) }}
                            onKeyDown={(e) => handleSearchInput(e)}
                        />
                        <InputRightElement>
                            <IconButton aria-label='Edit'
                                variant="ghost"
                                colorScheme='gray'
                                icon={<FiSearch
                                    color='gray.500'
                                />}
                                onClick={(e) => handleSearchClick(e)}
                                
                            />
                        </InputRightElement>
                    </InputGroup>
                </Box>
                <Box display="flex" alignItems="center" marginRight={'3rem'}>
                    <Image
                        alt=""
                        width={'2vw'}
                        position={'absolute'}
                        src="/persona@3x.png"
                        zIndex='1'
                    />
                    <Image
                        alt=""
                        position={'absolute'}
                        src="/personacontainer.svg"
                        zIndex='2'
                    />
                </Box>
            </HStack>
        </>
    )
}

export default Header;