import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export default function NewsletterEmail({
  title,
  excerpt,
  publishedAt,
  articleUrl,
  htmlBody,
}) {
  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={eyebrow}>William&apos;s Testbed</Text>
          <Heading style={heading}>{title}</Heading>
          <Text style={meta}>
            William Dorman{" "}
            <Link href="https://x.com/williiamdorman" style={metaInlineLink}>
              X
            </Link>{" "}
            · {publishedAt}
          </Text>
          {excerpt ? <Text style={excerptStyle}>{excerpt}</Text> : null}
          <Section style={contentSection}>
            <div style={content} dangerouslySetInnerHTML={{ __html: htmlBody }} />
          </Section>
          <Section style={ctaSection}>
            <Link href={articleUrl} style={ctaLink}>
              Read on the website
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f5f5f5",
  color: "#111111",
  fontFamily: "Georgia, serif",
  margin: "0",
  padding: "24px 12px",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e5e5",
  maxWidth: "680px",
  padding: "24px",
};

const eyebrow = {
  color: "#2e8b57",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  margin: "0 0 12px",
  textTransform: "uppercase",
};

const heading = {
  fontSize: "34px",
  lineHeight: "1.2",
  margin: "0 0 10px",
};

const meta = {
  color: "#666666",
  fontSize: "13px",
  margin: "0 0 14px",
};

const metaInlineLink = {
  color: "#2e8b57",
  textDecoration: "none",
};

const excerptStyle = {
  color: "#333333",
  fontSize: "17px",
  lineHeight: "1.6",
  margin: "0 0 20px",
};

const contentSection = {
  fontSize: "17px",
  lineHeight: "1.75",
};

const content = {
  color: "#111111",
};

const ctaSection = {
  marginTop: "28px",
  paddingTop: "16px",
  borderTop: "1px solid #ececec",
};

const ctaLink = {
  color: "#2e8b57",
  fontSize: "16px",
  textDecoration: "underline",
};
