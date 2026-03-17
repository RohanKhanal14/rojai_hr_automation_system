import InterviewAgent from "@/components/InterviewAgent";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CandidateInterviewPage({ params }: PageProps) {
  const { id } = await params;

  return <InterviewAgent sessionId={id} />;
}
