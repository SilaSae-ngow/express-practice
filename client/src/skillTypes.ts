export type Skill = {
  id: number;
  name: string;
  category: string | null;
};

export type SkillResponse = {
  items: Skill[];
  total: number;
};

export type CreateSkillInput = {
  name: string;
  category: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
  };
};

export type AuthCredentials = {
    email: string;
    password: string;
}
