import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/Pagination";
import type { PaginatedUsersResponse } from "@/types/users.type";

const PAGE_SIZE = 10;

const kycStyles: Record<string, string> = {
  approved: "text-emerald-400",
  under_review: "text-amber-400",
  pending: "text-amber-400",
  rejected: "text-rose-400",
};

interface UserManagementPageProps {
  data: PaginatedUsersResponse;
}

export default function UserManagementPage({ data }: UserManagementPageProps) {
  const { results, count } = data;

  return (
    <Card className="bg-[#13151e] border-white/5">
      <CardHeader className="px-5 pt-5 pb-0">
        <CardTitle className="text-white text-base font-semibold">
          Users ({count})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-white/35 font-medium px-5">
                User
              </TableHead>
              <TableHead className="text-white/35 font-medium">Email</TableHead>
              <TableHead className="text-white/35 font-medium">
                KYC Status
              </TableHead>
              <TableHead className="text-white/35 font-medium text-right pr-5">
                Transactions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell
                  colSpan={4}
                  className="text-center text-white/30 py-16 text-sm"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              results.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <TableCell className="text-white font-medium px-5 py-4">
                    {user.full_name}
                  </TableCell>
                  <TableCell className="text-white/70">{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold ${
                        kycStyles[user.kyc_status] ?? "text-white/50"
                      }`}
                    >
                      {user.kyc_label}
                    </span>
                  </TableCell>
                  <TableCell className="text-white/70 text-right pr-5">
                    {user.transaction_count}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination totalCount={count} pageSize={PAGE_SIZE} paramKey="page" />
      </CardContent>
    </Card>
  );
}