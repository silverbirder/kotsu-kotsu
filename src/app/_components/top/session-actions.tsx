import { Link } from "@/app/_components/link";
import { Button, Text, Stack } from "@mantine/core";
import { pagesPath } from "@/lib/$path";
import type { Session } from "next-auth";

export function SessionActions({ session }: { session: Session | null }) {
  return (
    <Stack gap={"sm"} justify={"flex-start"} align={"flex-start"}>
      {session ? (
        <>
          <Text>{session.user.name}さん、こんにちは！</Text>
          <Button component={Link} href={pagesPath.notebooks.$url().path}>
            記録しよう
          </Button>
          <Button component={Link} href={"/api/auth/signout"}>
            ログアウト
          </Button>
        </>
      ) : (
        <>
          <Text>まずはログイン！</Text>
          <Button component={Link} href={"/api/auth/signin"}>
            ログイン
          </Button>
        </>
      )}
    </Stack>
  );
}
