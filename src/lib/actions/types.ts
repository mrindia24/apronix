export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
  /** Set when the action created/updated something — used to trigger redirects. */
  id?: string;
  slug?: string;
};

export const initialActionState: ActionState = { ok: false, message: '' };
