"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import type { LinkProps as NextLinkProps } from "next/link";
import NextLink from "next/link";

type AnchorProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof NextLinkProps
>;

interface LinkProps extends AnchorProps, NextLinkProps {
  children: React.ReactNode;
}

export function Link({ children, href, ...props }: LinkProps) {
  const router = useViewTransitionRouter();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(typeof href === "string" ? href : "");
  };

  return (
    <NextLink {...props} href={href} onClick={handleLinkClick}>
      {children}
    </NextLink>
  );
}

const safeStartViewTransition = (callback: () => Promise<void> | void) => {
  if (!document.startViewTransition) {
    return void callback();
  }
  document.startViewTransition(callback);
};

const useViewTransitionRouter = (): ReturnType<typeof useRouter> => {
  const router = useRouter();
  const pathname = usePathname();

  const promiseCallbacks = useRef<Record<
    "resolve" | "reject",
    () => void
  > | null>(null);

  useLayoutEffect(() => {
    return () => {
      if (promiseCallbacks.current) {
        promiseCallbacks.current.resolve();
        promiseCallbacks.current = null;
      }
    };
  }, [pathname]);

  return {
    ...router,
    push: (href: Route) => {
      safeStartViewTransition(
        () =>
          new Promise((resolve, reject) => {
            promiseCallbacks.current = { resolve, reject };
            router.push(href);
          })
      );
    },
  };
};
