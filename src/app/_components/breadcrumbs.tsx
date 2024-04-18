import { Breadcrumbs as MantineBreadcrumbs, Anchor } from "@mantine/core";
import { Link } from "./link";

type Props = {
  items: {
    title: string;
    href: string;
  }[];
};
export function Breadcrumbs({ items }: Props) {
  return (
    <MantineBreadcrumbs style={{ flexWrap: "wrap" }}>
      {items.map(({ href, title }) => (
        <Anchor component={Link} href={href} key={href}>
          {title}
        </Anchor>
      ))}
    </MantineBreadcrumbs>
  );
}
