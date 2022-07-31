import {
  Button,
  Container,
  Flex,
  FormControl,
  Heading,
  Input,
  Select,
  Stack,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChangeEvent, useState } from "react";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [searchText, setSearchText] = useState("");
  const [type, setType] = useState("github");
  const router = useRouter();
  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"grey.50"}>
      <Container
        maxW={"xl"}
        bg={"white"}
        boxShadow={"xl"}
        rounded={"lg"}
        p={6}
        flexDirection={"column"}
      >
        <Heading
          as={"h2"}
          fontSize={{ base: "xl", sm: "2xl" }}
          textAlign={"center"}
          mb={5}
        >
          Enter Repo Link
        </Heading>
        <Stack
          direction={{ base: "column", md: "row" }}
          as={"form"}
          spacing={"12px"}
        >
          <Select
            width={"xs"}
            onChange={(e) => {
              setType(e.target.value);
            }}
          >
            <option value="npm">npm</option>
            <option value="github">Github</option>
            <option value="pypi">pypi</option>
            <option value="rubygems">ruby</option>
          </Select>
          <Input
            variant={"solid"}
            borderWidth={1}
            color={"gray.800"}
            _placeholder={{
              color: "gray.400",
            }}
            borderColor={"gray.300"}
            id={"searchText"}
            required
            placeholder={"Repo Link"}
            aria-label={"Repo Link"}
            value={searchText}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchText(e.target.value)
            }
          />
          <Button
            colorScheme={"blue"}
            width="xs"
            disabled={searchText.trim() === ""}
            type={"button"}
            onClick={() => {
              router.push(`/repo?type=${type}&url=${searchText}`);
            }}
          >
            Scan
          </Button>
        </Stack>
      </Container>
    </Flex>
  );
};

export default Home;
