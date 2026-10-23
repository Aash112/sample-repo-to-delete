import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // the invitation always starts at its gate: never restore an earlier scroll position on reload
    scrollRestoration: false,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
