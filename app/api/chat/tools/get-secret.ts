export const getSecretTool = {
  type: "function" as const,
  name: "get_secret",
  description: "Returns a secret value",
  parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  strict: false
};

export async function executeGetSecret() {
  return "🔐 Secret: abc123";
}
