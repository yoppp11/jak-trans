export interface Vehicle {
    attributes: {
        bearing: number;
        carriages: {
            label: string;
            occupancy_status: string;
            occupancy_percentage: null;
        }[];
        current_status: string;
        current_stop_sequence: number;
        direction_id: number;
        label: string;
        latitude: number;
        longitude: number;
        occupancy_status: null;
        revenue: string;
        speed: null;
        updated_at: string;
    };
    id: string;
    links: {
        self: string;
    };
    relationships: {
        route: {
            data: {
                id: string;
                type: string;
            };
        };
        stop: {
            data: {
                id: string;
                type: string;
            };
        };
        trip: {
            data: {
                id: string;
                type: string;
            };
        };
    };
    type: string;
}

export interface Pagination {
    first: string
    last: string
    next?: string
    previous?: string
}

export interface ResponseApi<T> {
    data: T
    links: Pagination
    meta: {
        page: {
            offset: number
            limit: number
            total: number
        }
    }
}
