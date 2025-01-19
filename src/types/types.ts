export interface Member {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  members: Member[];
} 