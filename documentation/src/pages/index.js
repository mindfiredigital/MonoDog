import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";

import MonodogLandingPage from "./MonodogLandingPage";

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description=""
    >
      <MonodogLandingPage></MonodogLandingPage>
    </Layout>
  );
}
