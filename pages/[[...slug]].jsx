import StarSite from "../components/StarSite";
import { resolveStarRoute } from "../lib/star-routes";

function routeFromSlug(slug) {
  if (!slug || slug.length === 0) {
    return "/";
  }

  return `/${slug.join("/")}`;
}

export async function getServerSideProps({ params }) {
  const path = routeFromSlug(params?.slug);
  const page = resolveStarRoute(path);

  if (!page) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      page,
      path,
    },
  };
}

export default function CatchAllStarPage({ page, path }) {
  return <StarSite page={page} path={path} />;
}
