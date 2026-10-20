import type { Command, WorkspaceState } from "../../domain/workflow";
export type Controller = {
  state: WorkspaceState;
  actorId: string;
  execute: (command: Command) => WorkspaceState | null;
  announce: (message: string, error?: boolean) => void;
};
