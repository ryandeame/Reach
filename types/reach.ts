export type ReachCompany = {
  id: string;
  name: string;
  location: string | null;
  phone: string | null;
  website: string | null;
};

export type ReachPerson = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  company_id: string | null;
  reach_companies?: Pick<ReachCompany, 'id' | 'name'> | null;
};

export type ReachOutreachLog = {
  id: string;
  person_id: string;
  comm_type: string;
  timestamp: string;
};

export type CreateCompanyInput = {
  name: string;
  location: string;
  phone: string;
  website: string;
};

export type CreatePersonInput = {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  companyId: string;
};

export type CreateOutreachLogInput = {
  personId: string;
  commType: string;
  timestamp?: string;
};
