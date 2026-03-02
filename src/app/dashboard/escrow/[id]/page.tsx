import EscrowDetailPage from "@/components/dashboard/superAdmin/EscrowDetailPage";
import React from "react";
interface PageProps {
  params: {
    id: string;
  };
}

async function page({ params }: PageProps) {
  const { id } = await params;

  if (!id)
    return (
      <div>
        <h1>No Id found</h1>
      </div>
    );
  return (
    <div>
      <EscrowDetailPage params={{ id }} />
    </div>
  );
}

export default page;
