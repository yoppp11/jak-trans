import { AlertTriangle, ChevronLeft, Clock, Filter, MapPin, Search, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import { http } from "../helpers/axios";
import { formatTime } from "../helpers/formatting";
import { type Pagination, type ResponseApi, type Vehicle } from "../helpers/type";
import LabelStatus from "../components/LabelStatus";
import { Link } from "react-router";


export default function Home(){
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [itemsPerPage, setItemsPerPage] = useState<number>(6)
    const [totalItems, setTotalItems] = useState<number>(0)
    const [paginationLinks, setPaginationLinks] = useState<Pagination | null>(null)

    const fetchData = async (page: number = 1) => {
        setIsLoading(true)

        try {
            const offset = (page - 1) * itemsPerPage

            const response = await http.get<ResponseApi<Vehicle[]>>('/vehicles', {
                params: {
                    'page[offset]': offset,
                    'page[limit]': itemsPerPage,
                    'include': 'trip',
                    'sort': 'updated_at' 
                }
            })

            console.log("Full API response:", response);
            
            const { data } = response.data;
            
            setVehicles(data);
            setFilteredVehicles(data);
            
            if (response.data.links) {
                setPaginationLinks(response.data.links);
                console.log("Pagination links:", response.data.links);
            }
            console.log("API response structure:", Object.keys(response.data));

            if (response.data.meta && response.data.meta.page && response.data.meta.page.total) {
                const total = response.data.meta.page.total;
                setTotalItems(total);
                const calculatedTotalPages = Math.ceil(total / itemsPerPage);
                setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
                console.log("Total pages from meta:", calculatedTotalPages);
            }

            else if (response.data.links && response.data.links.last) {
                try {

                    const lastUrl = new URL(response.data.links.last);
                    const lastOffsetStr = lastUrl.searchParams.get('page[offset]');
                    const lastLimitStr = lastUrl.searchParams.get('page[limit]') || String(itemsPerPage);
                    
                    if (lastOffsetStr) {
                        const lastOffset = parseInt(lastOffsetStr);
                        const lastLimit = parseInt(lastLimitStr);
                        const totalItems = lastOffset + lastLimit;
                        setTotalItems(totalItems);
                        const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
                        setTotalPages(calculatedTotalPages);
                        console.log("Total pages calculated from last link:", calculatedTotalPages);
                    } else {
                        setTotalPages(2); 
                        console.log("Setting default total pages: 2 (based on links)");
                    }
                } catch (error) {
                    console.log("Error parsing pagination links:", error);
                    setTotalPages(2);
                }
            } 
            else if (response.data.links && response.data.links.next) {
                setTotalPages(2);
                console.log("Setting minimal 2 pages because next link exists");
            }
            else {
                if (data.length < itemsPerPage) {
                    setTotalPages(1);
                    console.log("Only one page - data length less than items per page");
                } else {
                    setTotalPages(2); 
                    console.log("Assuming at least 2 pages based on data length");
                }
            }

            setCurrentPage(page);

        } catch (error) {
            console.log("API error:", error);
            Swal.fire({
                title: 'Error',
                text: 'Gagal mengambil data kendaraan',
                icon: 'error',
            });
            
            setVehicles([]);
            setFilteredVehicles([]);
            setTotalPages(1);
            
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(()=>{
        fetchData(1)
    }, [itemsPerPage])

    useEffect(() => {
        console.log("Current totalPages:", totalPages);
    }, [totalPages]);

    const shouldShowPagination = () => {

        if (paginationLinks && (paginationLinks.next || paginationLinks.previous)) {
            console.log("Showing pagination based on links");
            return true;
        }
        
        if (totalPages > 1) {
            console.log("Showing pagination based on totalPages");
            return true;
        }
        
        console.log("No pagination needed");
        return false;
    };

    const hasNextPage = () => {

        if (paginationLinks && paginationLinks.next) {
            return true;
        }

        return currentPage < totalPages;
    };
    

    const hasPrevPage = () => {

        if (paginationLinks && paginationLinks.previous) {
            return true;
        }

        return currentPage > 1;
    };

    useEffect(() => {
        if (vehicles.length === 0) return;
        
        let results = [...vehicles];
        
        if (statusFilter !== 'all') {
          results = results.filter(vehicle => 
            vehicle.attributes.current_status === statusFilter
          );
        }
        
        if (searchQuery) {
          const lowercaseQuery = searchQuery.toLowerCase();
          results = results.filter(vehicle => 
            (vehicle.attributes.label && vehicle.attributes.label.toLowerCase().includes(lowercaseQuery)) ||
            vehicle.id.toLowerCase().includes(lowercaseQuery)
          );
        }
        
        setFilteredVehicles(results);
      }, [searchQuery, statusFilter, vehicles]);

    const handlePageChange = (page: number) => {

        if (page < 1) return;
        
        if (paginationLinks) {
            if (page > currentPage && paginationLinks.next) {
                console.log("Using next link from API");
                fetchDataByUrl(paginationLinks.next);
                return;
            } else if (page < currentPage && paginationLinks.previous) {
                console.log("Using prev link from API");
                fetchDataByUrl(paginationLinks.previous);
                return;
            } else if (page !== currentPage && paginationLinks.last && page === totalPages) {
                console.log("Using last link from API");
                fetchDataByUrl(paginationLinks.last);
                return;
            } else if (page !== currentPage && paginationLinks.first && page === 1) {
                console.log("Using first link from API");
                fetchDataByUrl(paginationLinks.first);
                return;
            }
        }
        
        console.log("Using offset method for pagination");
        fetchData(page);
    };
    
    const fetchDataByUrl = async (url: string) => {
        setIsLoading(true);
        
        try {
            const response = await http.get<ResponseApi<Vehicle[]>>(url);
            
            const { data } = response.data;
            
            setVehicles(data);
            setFilteredVehicles(data);
            
            if (response.data.links) {
                setPaginationLinks(response.data.links);
            }
        
            try {
                const urlObj = new URL(url);
                const offset = parseInt(urlObj.searchParams.get('page[offset]') || '0');
                const limit = parseInt(urlObj.searchParams.get('page[limit]') || String(itemsPerPage));
                
                const estimatedPage = Math.floor(offset / limit) + 1;
                setCurrentPage(estimatedPage);
                console.log("Estimated current page:", estimatedPage);
            } catch (e) {
                console.log("Couldn't extract page number from URL");
            }
            
            if (response.data.meta && response.data.meta.page && response.data.meta.page.total) {
                setTotalItems(response.data.meta.page.total);
                setTotalPages(Math.ceil(response.data.meta.page.total / itemsPerPage));
            }
            
        } catch (error) {
            console.log("Error fetching by URL:", error);
            Swal.fire({
                title: 'Error',
                text: 'Gagal mengambil data kendaraan',
                icon: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
    )

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Pelacakan Kendaraan</h1>

                    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    placeholder="Cari kendaraan..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                    }}
                                /> 
                            </div>
                            <div className="w-full md:w-64">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Filter className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <select 
                                        name="status" 
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value)
                                        }}
                                        >
                                            <option value='all'>Semua Status</option>
                                            <option value='IN_TRANSIT_TO'>Dalam Perjalanan</option>
                                            <option value='STOPPED_AT'>Berhenti</option>
                                            <option value='INCOMING_AT'>Masuk</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 flex items-center">
                        <span className="text-gray-600">
                            Menampilkan {filteredVehicles.length} dari {vehicles.length} kendaraan
                        </span>
                    </div>

                    {filteredVehicles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVehicles.map((vehicle) => (
                                <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-bold text-gray-800">{vehicle.attributes.label}</h3>
                                            <LabelStatus status={vehicle.attributes.current_status} />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center text-gray-600">
                                                <Tag className="h-4 w-4 mr-2" />
                                                <span>ID: {vehicle.id}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                <span>Lokasi: {vehicle.attributes.latitude.toFixed(4)}, {vehicle.attributes.longitude.toFixed(4)}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Clock className="h-4 w-4 mr-2" />
                                                <span>Terakhir Diperbarui: {formatTime(vehicle.attributes.updated_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 px-5 py-3 flex justify-end">
                                        <Link 
                                            to={`/vehicles/${vehicle.id}`}
                                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                            Detail
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
                            <AlertTriangle className="h-12 w-12 text-yellow-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak ada data kendaraan yang ditemukan</h3>
                            <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian Anda</p>
                        </div>
                    )}

                    {shouldShowPagination() && (
                        <div className="mt-8 flex justify-center">
                            <nav className="inline-flex rounded-md shadow">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={!hasPrevPage()} 
                                    className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${!hasPrevPage() ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}>
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="sr-only">Previous</span>
                                </button>

                                {Array.from({ length: Math.min(5, totalPages)}, (_, index) => {
                                    let pageNumber;

                                    if(totalPages <= 5) {
                                        pageNumber = index + 1;
                                    } else if (currentPage <= 3) {
                                        pageNumber = index + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNumber = totalPages - 4 + index;
                                    } else {
                                        pageNumber = currentPage - 2 + index;
                                    }

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === pageNumber ? 'bg-blue-50 z-10 border-blue-500 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={!hasNextPage()} 
                                    className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${!hasNextPage() ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}>
                                        <span className="sr-only">Next</span>
                                        <ChevronLeft className="h-4 w-4 rotate-180" />
                                </button>
                            </nav>
                        </div>
                    )}

                    <div className="mt-4 flex justify-center items-center text-sm text-gray-700">
                        <span className="mr-2">Tampilkan</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value))
                                // fetchData(1)
                            }}
                            className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="6">6</option>
                                <option value="9">9</option>
                                <option value="12">12</option>
                                <option value="24">24</option>
                            </select>
                            <span className="ml-2">per halaman</span>
                    </div>
                </div>
            </div>
        </>
    )
}