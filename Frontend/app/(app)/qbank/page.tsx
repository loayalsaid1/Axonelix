import { redirect } from "next/navigation";

/**
 * /qbank → redirect to the first available section.
 */
export default function QBankPage() {
  redirect("/qbank/old-exams");
}
