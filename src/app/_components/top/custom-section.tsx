import { Text, Stack, Card } from "@mantine/core";
import { NotebookForm } from "../notebook-form";

export function CustomSection() {
  return (
    <Stack
      gap={"md"}
      align={"center"}
      justify={"flex-start"}
      style={{ flex: "1 1 45%", maxWidth: "330px" }}
    >
      <Card withBorder>
        <NotebookForm
          initialValues={{
            title: "コーヒーを飲んだ記録",
            items: [
              {
                label: "飲んだ量(ml)",
                valueType: "number",
                array: [{ value: "" }],
              },
            ],
          }}
          hiddenSubmit
        />
      </Card>
      <Text size="md">
        記録する内容を自分で自由に定義できます。
        例えば、飲んだコーヒーの量や飲んだ薬の種類などを記録できます。
        記録の形式は、文字、数字、はい・いいえ、カテゴリの4つがあります。
      </Text>
    </Stack>
  );
}
