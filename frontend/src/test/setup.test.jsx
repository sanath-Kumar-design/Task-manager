
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

function TestComponent() {
  return <h1>Task Manager</h1>;
}

describe("Task Manager", () => {
  it("renders the application heading", () => {
    render(<TestComponent />);

    expect(
      screen.getByRole("heading", { name: "Task Manager" })
    ).toBeInTheDocument();
  });
});