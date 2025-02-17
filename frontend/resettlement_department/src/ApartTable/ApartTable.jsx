import React, { useState, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import AdressCell from './Cells/AdressCell';
import FamilyCell from './Cells/Fio';
import PloshCell from './Cells/PloshCell';
import StatusCell from './Cells/StatusCell';
import Notes from './Cells/Notes';
import ApartDetails from './ApartDetails';

const ApartTable = ({ data, loading, selectedRow, setSelectedRow, isDetailsVisible, setIsDetailsVisible, apartType, fetchApartmentDetails, apartmentDetails, collapsed }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const tableContainerRef = useRef(null);

  const columns = React.useMemo(
    () => [
      {
        header: 'Адрес',
        accessorKey: 'house_address',
        enableSorting: true,
        cell: ({ row }) => <AdressCell props={row.original} />,
        size: 200,
      },
      ...(apartType === 'FamilyStructure'
        ? [
            {
              header: 'ФИО',
              accessorKey: 'fio',
              enableSorting: true,
              cell: ({ row }) => <FamilyCell props={row.original} />,
              size: 150,
            },
          ]
        : []), // Если apartType не равен 'FamilyStructure', то колонка не добавляется
      {
        header: 'Площадь, тип, этаж',
        accessorKey: 'full_living_area',
        cell: ({ row }) => <PloshCell props={row.original} />,
        size: 120,
      },
      {
        header: 'Статус',
        accessorKey: 'status',
        cell: ({ row }) => <StatusCell props={row.original} />,
        size: 120,
      },
      {
        header: 'Примечания',
        accessorKey: 'notes',
        cell: ({ row }) => <Notes props={row.original} />,
        size: 250,
      },
    ],
    [apartType]
  );
  

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 65,
    getScrollElement: () => tableContainerRef.current,
    overscan: 10,
  });


  function handleClick(index, visibility, val) {
    if (visibility) {
        if (index !== selectedRow) {
            setSelectedRow(index); // Обновляем выбранную строку
            apartType === "OldApart" ? fetchApartmentDetails(val["affair_id"]) : fetchApartmentDetails(val["new_apart_id"]);
        } else {
            setSelectedRow(false)
            setIsDetailsVisible(false); // Закрываем панель
        }
    } else {
        setSelectedRow(index); // Устанавливаем выбранную строку
        setIsDetailsVisible(true); // Открываем панел
        apartType === "OldApart" ? fetchApartmentDetails(val["affair_id"]) : fetchApartmentDetails(val["new_apart_id"]);
    }
}

  return (
    <div className="relative flex flex-col lg:flex-row h-[calc(100vh-1rem)] gap-2 bg-neutral-100 w-full transition-all duration-300">
      {loading ? (
        <div className="flex flex-1 justify-center h-64">
          <div className="relative flex flex-col place-items-center py-4 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cat stroke-muted-foreground h-12 w-12 stroke-1">
                    <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"></path>
                    <path d="M8 14v.5"></path>
                    <path d="M16 14v.5"></path>
                    <path d="M11.25 16.25h1.5L12 17l-.75-.75Z"></path>
                  </svg>
                </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Таблица */}
          <div
            className={` rounded-md h-full transition-all duration-300 ease-in-out  ${isDetailsVisible ? 'w-[80vw]' : 'flex-grow'}`}
          >
            <div
              ref={tableContainerRef}
              className={`${collapsed ? 'ml-[25px]' : 'ml-[260px]'} overflow-auto rounded-md border h-[calc(100vh-1rem)] w-[calc(100% - 25px)] transition-all ease-in-out scrollbar-custom`}
            >
              <table className="text-sm w-full border-collapse backdrop-blur-md sticky top-0 z-50">
                <thead className="border-b z-10 backdrop-blur-md shadow z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="hover:bg-muted/50 transition-colors">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          onClick={header.column.getToggleSortingHandler()}
                          className="px-2 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-600 tracking-wider cursor-pointer hover:bg-gray-50"
                          style={{ width: `${header.column.columnDef.size}px` }}
                        >
                          <div className="flex items-center">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc' ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-up h-4 w-4 -translate-x-[-25%] transition-transform scale-100"
                              >
                                <path d="m18 15-6-6-6 6"></path>
                              </svg>
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-up h-4 w-4 -translate-x-[-25%] transition-transform rotate-180 scale-100"
                              >
                                <path d="m18 15-6-6-6 6"></path>
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevrons-up-down text-muted-foreground/40 group-hover:text-muted-foreground ml-1 h-4 w-4 transition-transform scale-100"
                              >
                                <path d="m7 15 5 5 5-5"></path>
                                <path d="m7 9 5-5 5 5"></path>
                              </svg>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
              </table>

              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = table.getRowModel().rows[virtualRow.index];
                  return (
                    <div
                      key={row.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      onClick={() => handleClick(row.id, isDetailsVisible, row.original)}
                    >
                      <table className="w-full h-full table-fixed border-collapse">
                        <tbody>
                          <tr
                            className={`bg-white hover:bg-gray-100 ${
                              row.id === selectedRow ? 'bg-zinc-100' : 'hover:bg-gray-100'
                            } ${
                              (selectedRow || selectedRow === 0) && row.id !== selectedRow
                                ? ''
                                : ''
                            }`}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className="px-2 border-b border-gray-200 text-sm text-gray-700 truncate"
                                style={{ width: `${cell.column.columnDef.size}px` }}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ApartDetails */}
          {apartmentDetails && isDetailsVisible && (
            <div
              className={`ml-2 bg-white fixed inset-0 lg:static lg:inset-auto lg:overflow-auto lg:rounded-md lg:border lg:h-[calc(100vh-1rem)] transition-all duration-300 ease-in-out z-50 min-w-[650px] max-w-[650px]`}
            >
              <div className="fixed inset-0 bg-opacity-50 lg:bg-transparent lg:relative">
                <div
                  className={`fixed min-w-[650px] max-w-[650px] h-[calc(100vh-1rem)] overflow-y-auto transform transition-transform duration-300 ease-in-out ${
                    isDetailsVisible ? 'translate-x-0' : 'translate-x-full'
                  }`}
                  style={{
                    WebkitOverflowScrolling: 'touch', // Поддержка мобильных устройств
                  }}
                >
                  <div className="h-[calc(100vh-1rem)] flex flex-col">
                    <ApartDetails
                      apartmentDetails={apartmentDetails}
                      setIsDetailsVisible={setIsDetailsVisible}
                      apartType={apartType}
                      setSelectedRow={setSelectedRow}
                      className="flex-1" // Оставляем для гибкости внутри компонента
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
</div>

  );
};

export default ApartTable;