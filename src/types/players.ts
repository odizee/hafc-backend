export interface PlayerUpdateData {
  name?: string;
  positions?: string;
  bio?: string;
}

export interface BulkDeleteData {
  userIds: string[];
}
