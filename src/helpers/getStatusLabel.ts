export const getStatusLabel = (status: string): string =>{
    const statusMap: Record<string, string> = {
      'IN_TRANSIT_TO': 'Dalam Perjalanan',
      'STOPPED_AT': 'Berhenti',
      'INCOMING_AT': 'Akan Tiba'
    };
    
    return statusMap[status] || status;
}