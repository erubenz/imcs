import React from "react";
import PageWrapper from "./components/common/PageWrapper";
import SectionTitle from "./components/common/SectionTitle";

export default function NotFound() {
  return (
    <PageWrapper>
      <SectionTitle>Page Not Found</SectionTitle>
      <p>The page you are looking for does not exist.</p>
    </PageWrapper>
  );
}
