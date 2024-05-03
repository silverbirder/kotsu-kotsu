const buildSuffix = (url?: {query?: Record<string, string>, hash?: string}) => {
  const query = url?.query;
  const hash = url?.hash;
  if (!query && !hash) return '';
  const search = query ? `?${new URLSearchParams(query)}` : '';
  return `${search}${hash ? `#${hash}` : ''}`;
};

export const pagesPath = {
  "notebooks": {
    _notebookId: (notebookId: string | number) => ({
      "edit": {
        $url: (url?: { hash?: string }) => ({ pathname: '/notebooks/[notebookId]/edit' as const, query: { notebookId }, hash: url?.hash, path: `/notebooks/${notebookId}/edit${buildSuffix(url)}` })
      },
      "pages": {
        _pageId: (pageId: string | number) => ({
          "edit": {
            $url: (url?: { hash?: string }) => ({ pathname: '/notebooks/[notebookId]/pages/[pageId]/edit' as const, query: { notebookId, pageId }, hash: url?.hash, path: `/notebooks/${notebookId}/pages/${pageId}/edit${buildSuffix(url)}` })
          },
          $url: (url?: { hash?: string }) => ({ pathname: '/notebooks/[notebookId]/pages/[pageId]' as const, query: { notebookId, pageId }, hash: url?.hash, path: `/notebooks/${notebookId}/pages/${pageId}${buildSuffix(url)}` })
        }),
        "create": {
          $url: (url?: { hash?: string }) => ({ pathname: '/notebooks/[notebookId]/pages/create' as const, query: { notebookId }, hash: url?.hash, path: `/notebooks/${notebookId}/pages/create${buildSuffix(url)}` })
        },
        $url: (url?: { hash?: string }) => ({ pathname: '/notebooks/[notebookId]/pages' as const, query: { notebookId }, hash: url?.hash, path: `/notebooks/${notebookId}/pages${buildSuffix(url)}` })
      },
      $url: (url?: { hash?: string }) => ({ pathname: '/notebooks/[notebookId]' as const, query: { notebookId }, hash: url?.hash, path: `/notebooks/${notebookId}${buildSuffix(url)}` })
    }),
    "create": {
      $url: (url?: { hash?: string }) => ({ pathname: '/notebooks/create' as const, hash: url?.hash, path: `/notebooks/create${buildSuffix(url)}` })
    },
    $url: (url?: { hash?: string }) => ({ pathname: '/notebooks' as const, hash: url?.hash, path: `/notebooks${buildSuffix(url)}` })
  },
  $url: (url?: { hash?: string }) => ({ pathname: '/' as const, hash: url?.hash, path: `/${buildSuffix(url)}` })
};

export type PagesPath = typeof pagesPath;
