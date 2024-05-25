import { auth } from "@/server/auth";
import { Container, Title, Text, Flex, Divider, Stack } from "@mantine/core";
import { SessionActions } from "@/app/_components/top/session-actions";
import { NotebookSection } from "@/app/_components/top/notebook-section";
import { ChartSection } from "@/app/_components/top/chart-section";
import { CustomSection } from "@/app/_components/top/custom-section";

export default async function Page() {
  const session = await auth();
  return (
    <Container size={"lg"}>
      <Stack gap={"md"} align="flex-start">
        <Title order={1}>こつこつ</Title>
        <Text size="xl" fw={"bold"}>
          こつこつと、記録しよう！
        </Text>
        <Divider />
        <SessionActions session={session} />
        <Flex wrap={"wrap"} gap={"lg"}>
          <NotebookSection />
          <CustomSection />
          <ChartSection />
        </Flex>
      </Stack>
    </Container>
  );
}
