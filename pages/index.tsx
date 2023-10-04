import { Button, Flex, Heading, Input, } from "@chakra-ui/react";
import axios from "axios";
import { API_ENDPOINT } from "../components/state/const";
import { useState } from "react";
import { setSignInUserId, setToken } from "../components/util/actionUtil";
import { pathes } from "../components/state/pathes";

export default function LoginPage() {
    const [userId, setUserId] = useState("");
    const [userPassword, setUserPassword] = useState("");

    const logingGetToken = () => {
        if (userId == "" || userPassword == "") {
            alert("User Id or Password cannot be empty!");
            return;
        }

        axios.post(`${API_ENDPOINT}/login`, {
            user_id: userId,
            user_password: userPassword
        })
            .then((result: any) => {
                const token = result.data.access_token;
                //check if token is undefined or null
                if (!token) {
                    alert("Login Failed!");
                    return;
                } else {
                    setToken(token);
                    setSignInUserId(userId);
                    window.location.href = `${pathes.home}`;
                }
            }).catch((error: any) => {
                console.log(error);
            });
    }

    return (
        <Flex width="100vw" height="100vh" alignItems="center" background="blue.300" justifyContent="center">
            <Flex direction="column" minWidth={"400px"} background="gray.100" padding={6} rounded={6}>
                +        <Heading mb={6}>Visual Genius!</Heading>
                +        <Input placeholder="User Id" variant="outline" mb={3} type="email" background="white" onChange={(e) => setUserId(e.target.value)} />
                +        <Input placeholder="********" variant="outline" mb={6} type="password" background="white" onChange={(e) => setUserPassword(e.target.value)} />
                <Button mb={6} colorScheme="twitter" onClick={logingGetToken}>Sign-in</Button>
            </Flex>
        </Flex>
    )
}