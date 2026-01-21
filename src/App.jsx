import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
  Loader2,
} from "lucide-react";
import { fetchRecordsApi } from "./helper/fetch";

const PriceComparisonTable = () => {
  // --- STATE ---
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("milk");
  const [sortConfig, setSortConfig] = useState({
    key: "price",
    direction: "ascending",
  });
  const [filters, setFilters] = useState({
    store: "",
    brand: "",
    size: "",
  });

  // --- SPLASH SCREEN EFFECT ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // --- LOGIC ---
  const uniqueOptions = useMemo(() => {
    return {
      stores: [...new Set(records.map((item) => item.store))].sort(),
      brands: [...new Set(records.map((item) => item.brand))].sort(),
      sizes: [...new Set(records.map((item) => item.size))].sort(),
    };
  }, [records]);

  const filteredData = useMemo(() => {
    return records.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStore = filters.store ? item.store === filters.store : true;
      const matchesBrand = filters.brand ? item.brand === filters.brand : true;
      const matchesSize = filters.size ? item.size === filters.size : true;
      return matchesSearch && matchesStore && matchesBrand && matchesSize;
    });
  }, [searchTerm, filters, records]);

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // --- HANDLERS ---
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ store: "", brand: "", size: "" });
    setSearchTerm("");
  };

  const isFilterActive =
    filters.store || filters.brand || filters.size || searchTerm;

  // --- UI HELPERS ---

  // NEW: Determines the ROW background color
  const getRowColor = (storeName) => {
    switch (storeName) {
      case "Woolworths":
        // Light Green background, slightly darker on hover
        return "bg-green-50 hover:bg-green-100 border-green-100";
      case "Coles":
        // Light Red background
        return "bg-red-50 hover:bg-red-100 border-red-100";
      case "Aldi":
        // Light Blue background
        return "bg-blue-50 hover:bg-blue-100 border-blue-100";
      default:
        // Default White
        return "bg-white hover:bg-slate-50 border-slate-100";
    }
  };

  // Keep badge styles but make them solid white to pop against the colored row
  const getStoreBadgeStyles = (storeName) => {
    return "bg-white/80 backdrop-blur-sm text-slate-700 border-slate-200 shadow-sm";
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey)
      return <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1" />;
    if (sortConfig.direction === "ascending")
      return <ArrowUp className="w-3 h-3 text-indigo-600 ml-1" />;
    return <ArrowDown className="w-3 h-3 text-indigo-600 ml-1" />;
  };

  const TableHeader = ({ label, columnKey, align = "left" }) => (
    <th
      className={`py-4 px-4 font-semibold text-xs text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none ${align === "right" ? "text-right" : "text-left"}`}
      onClick={() => requestSort(columnKey)}
    >
      <div
        className={`flex items-center gap-1 ${align === "right" ? "justify-end" : "justify-start"}`}
      >
        {label}
        <SortIcon columnKey={columnKey} />
      </div>
    </th>
  );

  // fetch data
  const fetchData = async (queryTerm) => {
    setIsLoading(true);
    try {
      let data = await fetchRecordsApi(queryTerm);
      setRecords(data.data);
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData(searchTerm);
  }, []);

  // --- RENDER: SPLASH SCREEN ---
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="relative flex items-center justify-center mb-4">
          <div className="absolute w-16 h-16 bg-indigo-200 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-white p-4 rounded-full shadow-lg">
            <ShoppingCart className="w-10 h-10 text-indigo-600" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-indigo-900 font-semibold text-lg">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
          Loading Prices...
        </div>
      </div>
    );
  }

  // --- RENDER: MAIN APP ---
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header & Search */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-600" />
            Grocery Price Compare
          </h1>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition duration-150"
                placeholder="Search products (e.g. Milk, Bread)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="bg-indigo-600 text-white px-5 rounded-xl cursor-pointer active:bg-indigo-400 "
              onClick={() => {
                fetchData(searchTerm);
              }}
            >
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 pt-2 border-t border-slate-50 items-center">
            <div className="flex items-center gap-2 text-sm text-slate-500 min-w-max">
              <Filter className="w-4 h-4" /> Filters:
            </div>

            <div className="flex flex-wrap gap-2 w-full">
              <select
                className="block px-3 py-2 text-sm border border-gray-200 rounded-lg bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.store}
                onChange={(e) => handleFilterChange("store", e.target.value)}
              >
                <option value="">All Stores</option>
                {uniqueOptions.stores.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>

              <select
                className="block px-3 py-2 text-sm border border-gray-200 rounded-lg bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.brand}
                onChange={(e) => handleFilterChange("brand", e.target.value)}
              >
                <option value="">All Brands</option>
                {uniqueOptions.brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              <select
                className="block px-3 py-2 text-sm border border-gray-200 rounded-lg bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500"
                value={filters.size}
                onChange={(e) => handleFilterChange("size", e.target.value)}
              >
                <option value="">All Sizes</option>
                {uniqueOptions.sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors ml-auto md:ml-0"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col h-[600px]">
          <div className="overflow-auto flex-1">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                <tr>
                  <TableHeader label="Name" columnKey="name" />
                  <TableHeader label="Brand" columnKey="brand" />
                  <TableHeader label="Store" columnKey="store" />
                  <TableHeader label="Price" columnKey="price" align="right" />
                  <TableHeader
                    label="Per Unit"
                    columnKey="unitPrice"
                    align="right"
                  />
                  <TableHeader label="Size" columnKey="size" align="right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {sortedData.length > 0 ? (
                  sortedData.map((row) => (
                    <tr
                      key={row.id}
                      // Apply row color dynamically here
                      className={`transition-colors duration-150 group border-b ${getRowColor(row.store)}`}
                    >
                      <td className="py-1 px-4 text-sm font-medium text-slate-900">
                        {row.name}
                      </td>
                      <td className="py-1 px-4 text-sm text-slate-700">
                        {row.brand}
                      </td>
                      <td className="py-1 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStoreBadgeStyles(row.store)}`}
                        >
                          {row.store}
                        </span>
                      </td>
                      <td className="py-1 px-4 text-sm text-slate-900 font-bold text-right">
                        ${row.price.toFixed(2)}
                      </td>
                      <td className="py-1 px-4 text-xs text-slate-600 text-right">
                        {row.unitPriceString}
                      </td>
                      <td className="py-1 px-4 text-xs text-slate-600 text-right">
                        <span className="bg-white/60 text-slate-700 border border-slate-200/50 py-1 px-2 rounded-md">
                          {row.size}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-12 text-center text-slate-500"
                    >
                      No products found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 border-t border-slate-200 p-3 text-xs text-slate-500 text-right">
            Showing {sortedData.length} results
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceComparisonTable;
