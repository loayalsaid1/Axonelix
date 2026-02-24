import { redirect } from "next/navigation";

/**
 * /library → redirect to the modules listing page
 */
export default function LibraryIndexPage() {
  redirect("/library/modules");
}
