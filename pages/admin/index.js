import Head from "next/head";
import AdminComponents from "../../components/admin/Admin-components";

export default function Home() {
  return (
    <div>
      <Head>
        <title>{process.env.siteTitle}</title>
        <meta
          name="description"
          content={process.env.siteTitle}
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AdminComponents />
    </div>
  );
}
