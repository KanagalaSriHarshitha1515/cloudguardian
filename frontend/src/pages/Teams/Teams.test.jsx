import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Teams from "./Teams";
import * as teamService from "../../services/team.service";
import * as projectService from "../../services/project.service";

vi.mock("../../services/team.service");
vi.mock("../../services/project.service");

const mockTeams = [
  {
    id: "team-1",
    name: "Platform",
    description: "Platform team",
    ownerId: "user-1",
    members: [],
    projects: [],
  },
];

const mockProjects = [
  { id: "project-1", name: "Cloud" }];

describe("Teams page", () => {
  beforeEach(() => {
    teamService.getTeams.mockResolvedValue(mockTeams);
    projectService.getProjects.mockResolvedValue(mockProjects);
  });

  it("renders existing teams and assign controls", async () => {
    render(<Teams />);

    await waitFor(() => expect(teamService.getTeams).toHaveBeenCalled());

    expect(screen.getByText("Teams")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("Cloud")).toBeInTheDocument();
  });

  it("allows creating a new team", async () => {
    const user = userEvent.setup();
    teamService.createTeam.mockResolvedValue({ id: "team-2", name: "Ops" });
    render(<Teams />);

    await waitFor(() => expect(teamService.getTeams).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/Team name/i), "Ops");
    expect(screen.getByLabelText(/Team name/i)).toHaveValue("Ops");

    await user.click(screen.getByRole("button", { name: /Create team/i }));

    await waitFor(() => expect(teamService.createTeam).toHaveBeenCalledWith({ name: "Ops", description: "" }));
  });
});
