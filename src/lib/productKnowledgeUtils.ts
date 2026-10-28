import { ProductKnowledgeItem } from '../types/lms';

/**
 * Converts a ProductKnowledgeItem into a consolidated rich-text content string.
 * Preserves existing legacy fields (description, benefits, features, underwriting)
 * if product.content is not yet populated.
 */
export function getProductRichContent(product: ProductKnowledgeItem): string {
  if (product.content && product.content.trim().length > 0) {
    return product.content;
  }

  const sections: string[] = [];

  // 1. Overview
  if (product.description && product.description.trim()) {
    sections.push(`## Product Overview & Purpose\n\n${product.description.trim()}`);
  }

  // 2. Key Benefits
  if (Array.isArray(product.key_benefits) && product.key_benefits.length > 0) {
    const valid = product.key_benefits.filter((b) => b && b.trim().length > 0);
    if (valid.length > 0) {
      sections.push(
        `## Key Benefits & Protections\n\n` + valid.map((b) => `- ${b.trim()}`).join('\n')
      );
    }
  }

  // 3. Key Features
  if (Array.isArray(product.key_features) && product.key_features.length > 0) {
    const valid = product.key_features.filter((f) => f && f.trim().length > 0);
    if (valid.length > 0) {
      sections.push(
        `## Policy Features & Contract Terms\n\n` +
          valid.map((f, i) => `${i + 1}. ${f.trim()}`).join('\n')
      );
    }
  }

  // 4. Underwriting & Market Parameters
  const underwriting: string[] = [];
  if (product.eligibility_criteria && product.eligibility_criteria.trim()) {
    underwriting.push(`- **Eligibility Criteria:** ${product.eligibility_criteria.trim()}`);
  }
  if (product.coverage_details && product.coverage_details.trim()) {
    underwriting.push(`- **Sum Assured & Coverage Scope:** ${product.coverage_details.trim()}`);
  }
  if (product.premium_terms && product.premium_terms.trim()) {
    underwriting.push(`- **Premium Payment Terms:** ${product.premium_terms.trim()}`);
  }
  if (product.target_audience && product.target_audience.trim()) {
    underwriting.push(`- **Target Market & Client Profile:** ${product.target_audience.trim()}`);
  }
  if (underwriting.length > 0) {
    sections.push(`## Underwriting & Coverage Parameters\n\n` + underwriting.join('\n'));
  }

  // 5. Additional Custom Sections
  if (Array.isArray(product.additional_sections) && product.additional_sections.length > 0) {
    for (const sec of product.additional_sections) {
      if (sec.title?.trim() && sec.content?.trim()) {
        sections.push(`## ${sec.title.trim()}\n\n${sec.content.trim()}`);
      }
    }
  }

  return sections.join('\n\n');
}
