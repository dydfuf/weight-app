import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Not found</h1>
      <Link className="underline" to="/">
        Go home
      </Link>
    </div>
  );
}
