import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  // 1) Локальные состояния
  const [apartType, setApartType] = useState("NewApartment");

  // Данные для дерева
  const [districts, setDistricts] = useState([]);
  const [municipalDistricts, setMunicipalDistricts] = useState({});
  const [houseAddresses, setHouseAddresses] = useState({});

  // Данные для таблицы и деталей
  const [apartments, setApartments] = useState([]);
  const [apartmentDetails, setApartmentDetails] = useState(null);

  // Кто раскрыт в дереве (ключ = district/municipal, значение = true/false)
  const [expandedNodes, setExpandedNodes] = useState({});

  // Поиск по ID
  const [searchTerm, setSearchTerm] = useState("");

  // Ссылка на панель деталей (чтобы закрывать при клике вне)
  const detailsRef = useRef(null);

  // 2) Эффекты
  // При смене типа сбрасываем дерево и грузим районы
  useEffect(() => {
    resetFilters();
    fetchDistricts();
  }, [apartType]);

  // Закрытие панели деталей при клике вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (detailsRef.current && !detailsRef.current.contains(e.target)) {
        setApartmentDetails(null);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // 3) Методы
  const resetFilters = () => {
    setExpandedNodes({});
    setMunicipalDistricts({});
    setHouseAddresses({});
    setApartments([]);
    setApartmentDetails(null);
    setSearchTerm("");
  };

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`/tables/district?apart_type=${apartType}`);
      setDistricts(response.data);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const fetchMunicipalDistricts = async (district) => {
    try {
      const response = await axios.get(
        `/tables/municipal_district?apart_type=${apartType}&municipal_district=${district}`
      );
      setMunicipalDistricts((prev) => ({ ...prev, [district]: response.data }));
    } catch (error) {
      console.error("Error fetching municipal districts:", error);
    }
  };

  const fetchHouseAddresses = async (municipal) => {
    try {
      const response = await axios.get(
        `/tables/house_addresses?apart_type=${apartType}&areas=${municipal}`
      );
      setHouseAddresses((prev) => ({ ...prev, [municipal]: response.data }));
    } catch (error) {
      console.error("Error fetching house addresses:", error);
    }
  };

  const fetchApartments = async (addresses) => {
    try {
      const response = await axios.get(
        `/tables/apartments?apart_type=${apartType}&house_addresses=${addresses.join(",")}`
      );
      setApartments(response.data);
    } catch (error) {
      console.error("Error fetching apartments:", error);
    }
  };

  const fetchApartmentDetails = async (apartmentId) => {
    try {
      const response = await axios.get(
        `/tables/apartment/${apartmentId}?apart_type=${apartType}`
      );
      setApartmentDetails(response.data);
    } catch (error) {
      console.error("Error fetching apartment details:", error);
    }
  };

  // Переключаем раскрытие для конкретного узла (district или municipal)
  const toggleExpand = (key) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 4) Фильтрация квартир по ID (new_apart_id)
  const filteredApartments = apartments.filter((apt) =>
    String(apt.new_apart_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 5) Рендер
  return (
    <div className="flex min-h-screen bg-white text-gray-800">
      {/* ======== Сайдбар с деревом ======== */}
      <div className="w-1/4 p-4 border-r border-gray-300 overflow-y-auto">
        {/* Кнопки выбора типа */}
        <div className="flex justify-between mb-4">
          <button
            onClick={() => setApartType("NewApartment")}
            className={`px-16 py-4 rounded-md ${
              apartType === "NewApartment"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Ресурс
          </button>
          <button
            onClick={() => setApartType("FamilyStructure")}
            className={`px-16 py-4 rounded-md ${
              apartType === "FamilyStructure"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Семьи
          </button>
        </div>

        {/* ======== Дерево район → муниципалитет → адрес ======== */}
        <ul>
          {districts.map((district) => {
            const isDistOpen = expandedNodes[district] ?? false;
            return (
              <li key={district} className="mb-2">
                {/* Шапка района */}
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault(); // убираем переход по ссылке
                    toggleExpand(district);

                    // Ленивая загрузка муниципальных округов
                    if (!municipalDistricts[district]) {
                      fetchMunicipalDistricts(district);
                    }
                  }}
                  className="flex items-center px-2 hover:bg-secondary-100 focus:text-primary active:text-primary"
                >
                  {/* Стрелка, поворачиваем при раскрытии */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="h-4 w-4 me-1"
                    style={{
                      transform: isDistOpen ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                  {district}
                </a>

                {/* Список муниципалитетов */}
                <ul className={`ml-4 !visible ${isDistOpen ? "" : "hidden"}`}>
                  {municipalDistricts[district]?.map((municipal) => {
                    const isMunOpen = expandedNodes[municipal] ?? false;
                    return (
                      <li key={municipal} className="mb-2">
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleExpand(municipal);
                            // Ленивая загрузка адресов
                            if (!houseAddresses[municipal]) {
                              fetchHouseAddresses(municipal);
                            }
                          }}
                          className="flex items-center px-2 hover:bg-secondary-100 focus:text-primary active:text-primary"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            stroke="currentColor"
                            className="h-4 w-4 me-1"
                            style={{
                              transform: isMunOpen
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.2s",
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                          </svg>
                          {municipal}
                        </a>

                        {/* Список адресов */}
                        <ul
                          className={`ml-4 !visible ${
                            isMunOpen ? "" : "hidden"
                          }`}
                        >
                          {houseAddresses[municipal]?.map((address) => (
                            <li
                              key={address}
                              className="px-2 hover:bg-secondary-100"
                            >
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  // По клику грузим квартиры этого адреса
                                  fetchApartments([address]);
                                }}
                                className="flex items-center px-2 hover:bg-secondary-100 focus:text-primary active:text-primary"
                              >
                                {address}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ======== Правая часть: таблица + панель деталей ======== */}
      <div className="relative flex-1 p-4 overflow-y-auto">
        {/* Когда есть apartments, отображаем таблицу */}
        {apartments.length > 0 && (
          <>
            <h2 className="text-lg font-bold mb-4">Apartments</h2>

            {/* Поиск по ID */}
            <div className="mb-4 max-w-xs">
              <div className="relative">
              <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by ID"
                      className="py-2 px-3 pl-9 block w-full border border-gray-300 shadow-sm rounded-lg text-sm 
                                focus:z-10 focus:border-blue-500 focus:ring-blue-500
                                bg-white text-gray-800 placeholder:text-gray-400"
                    />
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <svg
                    className="size-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="7" cy="7" r="5"></circle>
                    <path d="m11 11 3 3"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Таблица */}
            <div className="-m-1.5 overflow-x-auto">
              <div className="p-1.5 min-w-full inline-block align-middle">
                <div className="border rounded-lg divide-y divide-gray-200">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                          >
                            ID
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                          >
                            District
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                          >
                            Municipal
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase"
                          >
                            Address
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase"
                          >
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredApartments.map((apartment) => (
                          <tr key={apartment.new_apart_id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                              {apartment.new_apart_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {apartment.district}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {apartment.municipal_district}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                              {apartment.house_address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                              <button
                                type="button"
                                className="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent 
                                           text-blue-600 hover:text-blue-800 focus:outline-none focus:text-blue-800"
                                onClick={() =>
                                  fetchApartmentDetails(apartment.new_apart_id)
                                }
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}

                        {filteredApartments.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-4 text-center text-sm text-gray-500"
                            >
                              No apartments found for this ID
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Детали квартиры (панель справа) */}
        {apartmentDetails && (
          <div
            ref={detailsRef}
            className="details-panel absolute right-0 top-0 w-1/3 h-full bg-white shadow-lg border-l border-gray-300 p-4 overflow-y-auto"
          >
            <h2 className="text-lg font-bold mb-4">Apartment Details</h2>
            <div className="space-y-2 text-sm">
              <p>
                <strong>ID:</strong> {apartmentDetails.new_apart_id}
              </p>
              <p>
                <strong>District:</strong> {apartmentDetails.district}
              </p>
              <p>
                <strong>Municipal:</strong>{" "}
                {apartmentDetails.municipal_district}
              </p>
              <p>
                <strong>Address:</strong> {apartmentDetails.house_address}
              </p>
              <p>
                <strong>Apartment Number:</strong>{" "}
                {apartmentDetails.apart_number}
              </p>
              <p>
                <strong>Floor:</strong> {apartmentDetails.floor}
              </p>
              <p>
                <strong>Room Count:</strong> {apartmentDetails.room_count}
              </p>
              <p>
                <strong>Living Area:</strong> {apartmentDetails.living_area} m²
              </p>
              <p>
                <strong>Status:</strong> {apartmentDetails.status}
              </p>
              <p>
                <strong>Owner:</strong> {apartmentDetails.owner}
              </p>
              <p>
                <strong>Notes:</strong> {apartmentDetails.notes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;