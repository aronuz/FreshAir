export interface stateType {
    title: string,
    email?: string,
    phone?: string,
    address: string,
    start_date: string,
    start_time: string,
    end_date?: string,
    end_time: string,
    notes: string
}
interface updatedType extends stateType {
    id?: number
}

export type Database = {
    public: {
      Tables: {
        appointments: {
          Row: stateType; // Define what a row in the table looks like
          Insert: stateType; // Define the type for inserting data
          Update: Partial<updatedType>; // Define the type for updating data
        };
      };
    };
  };