export interface CurrentEstablishmentPayload {
  id: number;
  phone: string;
  role: "establishment";
  establishment_id: number;
}
export interface CurrentCollaboratorPayload {
  id: number;
  phone: string;
  role: "collaborator";
  establishment_id: number;
}

export type CurrentUserPayload =
  CurrentEstablishmentPayload | CurrentCollaboratorPayload;
