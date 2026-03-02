import MyDisputeDetailPage from "@/components/dashboard/keyDashboard/MyDisputeDetailPage";

interface PageProps {
  params: {
    id: string;
  };
}
async function page({ params }: PageProps) {
  const { id } = await params;
  return (
    <div>
      <MyDisputeDetailPage params={{ id }} />
    </div>
  );
}

export default page;
