
import 'leaflet/dist/leaflet.css';
import { Clock, Info, Map, Navigation, Route, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { ResponseApi, Vehicle } from '../helpers/type';
import LabelStatus from '../components/LabelStatus';
import { getStatusLabel } from '../helpers/getStatusLabel';
import { formatTime } from '../helpers/formatting';
import DataItem from '../components/DataItem';
import { http } from '../helpers/axios';
import Swal from 'sweetalert2';
import { useParams } from 'react-router';


export default function VehicleDetailPage() {
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { id } = useParams<{ id: string }>();

    const fetchData = async (id: string) => {
    try {
        setIsLoading(true);
        setError(null)
        const response = await http.get<ResponseApi<Vehicle>>(`/vehicles/${id}`, {
            params: {
                'include': 'trip'
            }
        })

        setVehicle(response.data.data);
        // console.log(vehicle);
        console.log(response.data.data);
        
        
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load vehicle data. Please try again.',
            confirmButtonText: 'OK'
        })
    } finally {
        setIsLoading(false);
    }
    }

    useEffect(() => {

        fetchData(id || '');
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading vehicle data...</p>
            </div>
            </div>
        );
    }

    if (error || !vehicle) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
                    <div className="flex items-center justify-center text-red-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600 text-center">{error || 'Vehicle data not found'}</p>
                    <button 
                    className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                    onClick={() => fetchData(id || '')}
                    >
                    Retry
                    </button>
                </div>
            </div>
        );
    }

    const { attributes, relationships } = vehicle;
    const position: [number, number] = [attributes.latitude, attributes.longitude];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                    <h1 className="text-xl font-bold text-gray-900">Detail Kendaraan</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Lokasi Kendaraan</h2>
                    <p className="text-sm text-gray-500">Posisi terkini dari kendaraan pada peta</p>
                    </div>
                    <div className="h-96 relative">
                    <MapContainer 
                        center={position} 
                        zoom={13} 
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={position}>
                            <Popup>
                                <div className="font-medium">{attributes.label}</div>
                                <div className="text-sm">{getStatusLabel(attributes.current_status)}</div>
                                <div className="text-xs text-gray-500">
                                {attributes.latitude}, {attributes.longitude}
                                </div>
                            </Popup>
                        </Marker>
                    </MapContainer>
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-500">
                        <Info className="h-4 w-4 mr-1" />
                        <span>Klik pada marker untuk melihat detail singkat kendaraan</span>
                    </div>
                    </div>
                </div>
                </div>

                <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">Informasi Kendaraan</h2>
                        <p className="text-sm text-gray-500">Detail lengkap kendaraan</p>
                    </div>
                    <LabelStatus status={attributes.current_status} />
                    </div>
                    
                    <div className="p-4 space-y-1">
                    <DataItem 
                        icon={<Truck className="h-5 w-5 text-indigo-600" />}
                        label="Label Kendaraan"
                        value={attributes.label}
                    />
                    
                    <DataItem 
                        icon={<Map className="h-5 w-5 text-indigo-600" />}
                        label="Koordinat"
                        value={
                        <div className="flex flex-col">
                            <span>Latitude: {attributes.latitude}</span>
                            <span>Longitude: {attributes.longitude}</span>
                        </div>
                        }
                    />
                    
                    <DataItem 
                        icon={<Clock className="h-5 w-5 text-indigo-600" />}
                        label="Update Terakhir"
                        value={formatTime(attributes.updated_at)}
                    />
                    
                    <DataItem 
                        icon={<Navigation className="h-5 w-5 text-indigo-600" />}
                        label="Arah & Kecepatan"
                        value={
                        <div className="flex flex-col">
                            <span>Bearing: {attributes.bearing}°</span>
                            <span>Kecepatan: {attributes.speed || 'Tidak tersedia'}</span>
                        </div>
                        }
                    />
                    
                    <DataItem 
                        icon={<Route className="h-5 w-5 text-indigo-600" />}
                        label="Data Rute & Trip"
                        value={
                        <div className="flex flex-col">
                            <span>ID Rute: {relationships.route.data?.id}</span>
                            <span>ID Trip: {relationships.trip.data?.id}</span>
                            <span>Stop Sequence: {attributes.current_stop_sequence}</span>
                        </div>
                        }
                    />
                    
                    {attributes.carriages.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Informasi Gerbong</h3>
                        <div className="space-y-2">
                            {attributes.carriages.map((carriage, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                                <div className="font-medium text-sm">{carriage.label}</div>
                                <div className="text-xs text-gray-500">
                                Status Okupansi: {carriage.occupancy_status.replace(/_/g, ' ')}
                                </div>
                            </div>
                            ))}
                        </div>
                        </div>
                    )}
                    </div>
                </div>
                </div>
            </div>
            </main>
        </div>
    );
}