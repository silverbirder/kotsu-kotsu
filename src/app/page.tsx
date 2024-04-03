import { auth } from "@/server/auth";
import { Link } from "@/app/_components/link";
import { Button, Container, Title, Text, Flex, Divider } from "@mantine/core";
import { pagesPath } from "@/lib/$path";

export default async function Page() {
  const session = await auth();
  return (
    <Container>
      <Flex gap={"md"} direction={"column"}>
        <Title order={1}>こつこつ</Title>
        <Text size="xl">こつこつと、記録しよう</Text>
        <Divider />
        <Flex
          gap={"sm"}
          direction={"column"}
          justify={"flex-start"}
          align={"flex-start"}
        >
          <Text>
            {session
              ? `${session.user.name}さん、こんにちは！`
              : "まずはログイン！"}
          </Text>
          <Button
            component={Link}
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
          >
            {session ? "Sign out" : "Sign in"}
          </Button>
        </Flex>
        {session && (
          <Flex
            gap={"sm"}
            direction={"column"}
            justify={"flex-start"}
            align={"flex-start"}
          >
            <Text></Text>
            <Button component={Link} href={pagesPath.notebooks.$url().path}>
              記録しよう
            </Button>
          </Flex>
        )}
      </Flex>
    </Container>
  );
}
