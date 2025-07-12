// Company logo mapping and utility functions
export const companyLogos: Record<string, string> = {
  // Major Tech Companies
  "Google": "https://logo.clearbit.com/google.com",
  "Microsoft": "https://logo.clearbit.com/microsoft.com",
  "Apple": "https://logo.clearbit.com/apple.com",
  "Amazon": "https://logo.clearbit.com/amazon.com",
  "Meta": "https://logo.clearbit.com/meta.com",
  "Netflix": "https://logo.clearbit.com/netflix.com",
  "Uber": "https://logo.clearbit.com/uber.com",
  "Cisco": "https://logo.clearbit.com/cisco.com",
  "Airbnb": "https://logo.clearbit.com/airbnb.com",
  "OpenAI": "https://logo.clearbit.com/openai.com",
  "Spotify": "https://logo.clearbit.com/spotify.com",
  "Stripe": "https://logo.clearbit.com/stripe.com",
  "Cloudflare": "https://logo.clearbit.com/cloudflare.com",
  "Shopify": "https://logo.clearbit.com/shopify.com",
  "Snowflake": "https://logo.clearbit.com/snowflake.com",
  "Figma": "https://logo.clearbit.com/figma.com",
  "Discord": "https://logo.clearbit.com/discord.com",
  "Tesla": "https://logo.clearbit.com/tesla.com",
  "Salesforce": "https://logo.clearbit.com/salesforce.com",
  "Adobe": "https://logo.clearbit.com/adobe.com",
  "LinkedIn": "https://logo.clearbit.com/linkedin.com",
  "Palo Alto Networks": "https://logo.clearbit.com/paloaltonetworks.com",

  // Indian IT Companies
  "Infosys": "https://logo.clearbit.com/infosys.com",
  "Wipro": "https://logo.clearbit.com/wipro.com",
  "TCS": "https://logo.clearbit.com/tcs.com",
  "HCL Technologies": "https://logo.clearbit.com/hcl.com",
  "Tech Mahindra": "https://logo.clearbit.com/techmahindra.com",
  "Cognizant": "https://logo.clearbit.com/cognizant.com",
  "L&T Infotech": "https://logo.clearbit.com/lntinfotech.com",
  "Mindtree": "https://logo.clearbit.com/mindtree.com",

  // Mock Companies - using placeholder logos
  "TechCorp Inc.": "/placeholder.svg?height=40&width=40",
  "Growth Marketing Co.": "/placeholder.svg?height=40&width=40",
  "Design Studio Pro": "/placeholder.svg?height=40&width=40",
  "Investment Partners LLC": "/placeholder.svg?height=40&width=40",

  // Fallback for any other companies
  "default": "/placeholder.svg?height=40&width=40",
};

// Cache for dynamically fetched logos
const logoCache = new Map<string, string>();

export const getCompanyLogo = (companyName: string): string => {
  // Try to find exact match first
  if (companyLogos[companyName]) {
    return companyLogos[companyName];
  }

  // Try to find partial match (case insensitive)
  const normalizedCompanyName = companyName.toLowerCase();
  for (const [key, logo] of Object.entries(companyLogos)) {
    if (key.toLowerCase().includes(normalizedCompanyName) || 
        normalizedCompanyName.includes(key.toLowerCase())) {
      return logo;
    }
  }

  // Return default placeholder if no match found
  return companyLogos.default;
};

export const getCompanyLogoAsync = async (companyName: string): Promise<string> => {
  // Check cache first
  if (logoCache.has(companyName)) {
    return logoCache.get(companyName)!;
  }

  // Check existing logos first
  const existingLogo = getCompanyLogo(companyName);
  if (existingLogo && !existingLogo.includes("placeholder")) {
    logoCache.set(companyName, existingLogo);
    return existingLogo;
  }

  try {
    // Search for logo using our API
    const response = await fetch("/api/company-logo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ companyName }),
    });

    if (response.ok) {
      const data = await response.json();
      const logoUrl = data.logoUrl;
      
      // Cache the result
      logoCache.set(companyName, logoUrl);
      return logoUrl;
    }
  } catch (error) {
    console.error("Error fetching company logo:", error);
  }

  // Return placeholder if all else fails
  const placeholder = companyLogos.default;
  logoCache.set(companyName, placeholder);
  return placeholder;
}; 