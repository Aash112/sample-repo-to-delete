import { createFileRoute, redirect } from "@tanstack/react-router";

// The site has a single page: send the bare domain to the invitation.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/invite/a7K9xP4mQ2L8" });
  },
});
