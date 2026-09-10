import test from "node:test";
import assert from "node:assert/strict";

// Test heuristic and prompt compiler
function renderPrompt(promptTemplate, fieldValues) {
  let rendered = promptTemplate;
  for (const [key, value] of Object.entries(fieldValues)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    rendered = rendered.replace(regex, value || "");
  }
  return rendered.replace(/{{\s*[^}]+\s*}}/g, "").trim();
}

test("Template prompt renderer substitutes variable tags correctly", () => {
  const template = "I need to request {{leaveType}} from {{startDate}} to {{endDate}}. Reason: {{reason}}.";
  const values = {
    leaveType: "Annual Leave",
    startDate: "Oct 12",
    endDate: "Oct 15",
    reason: "Family wedding",
  };

  const output = renderPrompt(template, values);
  assert.equal(output, "I need to request Annual Leave from Oct 12 to Oct 15. Reason: Family wedding.");
});

test("Template prompt renderer strips unfilled optional tags cleanly", () => {
  const template = "Request for {{leaveType}} on {{startDate}}. Handover: {{handover}}.";
  const values = {
    leaveType: "Medical Leave",
    startDate: "Tomorrow",
    // handover left empty
  };

  const output = renderPrompt(template, values);
  assert.equal(output, "Request for Medical Leave on Tomorrow. Handover: .");
});
