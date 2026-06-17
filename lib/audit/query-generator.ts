export function generateAuditQueries(category: string, city: string, state: string) {
  const location = `${city}, ${state}`;
  return [
    `Who are the top 5 ${category} businesses in ${location}? Return only business names as a numbered list.`,
    `I need a reliable ${category} in ${location}. Who do you recommend and why? List specific business names.`,
  ];
}
