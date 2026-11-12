import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page introuvable</h2>
        <p className="mt-2 text-sm text-mh-black/60">Cette page n'existe pas.</p>
        <Link to="/" className="btn-mh mt-6">Retour à l'accueil</Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFound,
});
