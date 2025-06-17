export type Database = {
	public: {
		Tables: {
			user: {
				Row: {
					id: string;
					name: string;
					email: string;
					auth_id: string;
					password: string;
				};
			};
		};
	};
};
