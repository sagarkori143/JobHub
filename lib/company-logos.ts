import companyLogosJson from "../data/company-logos.json";

const companyLogos: Record<string, string> = companyLogosJson;

export const getCompanyLogo = (companyName: string): string => {
  // Try to find exact match first
  if (companyLogos[companyName]) {
    return companyLogos[companyName];
  }

  // Try to find partial match (case insensitive)
  const normalizedCompanyName = companyName.toLowerCase();
  for (const key of Object.keys(companyLogos)) {
    if (
      key.toLowerCase().includes(normalizedCompanyName) ||
      normalizedCompanyName.includes(key.toLowerCase())
    ) {
      return companyLogos[key];
    }
  }

  // Return default placeholder if no match found
  return companyLogos["default"];
}; 