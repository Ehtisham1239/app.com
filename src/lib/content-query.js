// Missing/unpublished content and unavailable content are different outcomes.
// Throw on backend failures so ISR keeps its last successful page instead of
// caching an empty listing or a false 404. Only initial schema absence uses seeds.
export async function readContentQuery(query, { fallback, label, schemaFallback, onSchemaMissing }) {
  const { data, error } = await query();
  if (error) {
    if (error.code === "PGRST205") {
      onSchemaMissing();
      return schemaFallback();
    }
    throw new Error(`Public content temporarily unavailable: ${label}`, { cause: error });
  }
  return data ?? fallback;
}
