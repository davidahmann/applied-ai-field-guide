export function authorize() {
  return Object.freeze({ decision: "deny", reason: "canonical_template" });
}
