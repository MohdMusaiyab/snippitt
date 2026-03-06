import { getExploreUsers } from "@/actions/user/exploreUser";
import ExploreUsersClient from "@/app/components/user/ExploreUsersClient";

export default async function ExploreUsersPage() {
  const result = await getExploreUsers(0, "");

  return (
    <ExploreUsersClient initialUsers={result.data || []} />
  );
}