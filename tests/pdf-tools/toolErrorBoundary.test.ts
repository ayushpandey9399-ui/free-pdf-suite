import { test, expect } from "bun:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { ToolErrorBoundary, ToolLoadError } from "../../src/components/ToolErrorBoundary";

// Regression for the /tools/compare Soft 404: a failing tool must be caught
// locally instead of bubbling up and replacing the whole page.
test("a tool error is caught by the local boundary", () => {
  const state = ToolErrorBoundary.getDerivedStateFromError(new Error("chunk failed"));
  expect(state.error?.message).toBe("chunk failed");
});

test("the contained error names the tool and offers a reload, not a 404", () => {
  const html = renderToString(createElement(ToolLoadError, { toolName: "Compare PDFs" })).replace(/<!-- -->/g, "");
  expect(html).toContain("Compare PDFs could not start");
  expect(html).toContain("Reload the tool");
  expect(html.toLowerCase()).not.toContain("not found");
  expect(html).not.toContain("404");
});

test("a healthy tool renders its children unchanged", () => {
  const html = renderToString(
    createElement(ToolErrorBoundary, { toolName: "Compare PDFs" }, createElement("p", null, "tool ui")),
  );
  expect(html).toBe("<p>tool ui</p>");
});
