type ClientDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;

  return (
    <section className="card">
      <h1 style={{ marginTop: 0 }}>Client Detail</h1>
      <p style={{ color: "#64748b" }}>Client ID: {id}</p>
    </section>
  );
}
