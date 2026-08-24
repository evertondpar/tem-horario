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

export interface CurrentClientPayload {
  id: number;
  phone: string;
  role: "client";
  establishment_id: null;
}

export type CurrentUserPayload =
  | CurrentEstablishmentPayload
  | CurrentCollaboratorPayload
  | CurrentClientPayload;
