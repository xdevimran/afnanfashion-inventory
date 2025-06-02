"use client";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

const productList = {
  "Sabiha Full Set": 1600,
  "Sabiha Hijab Niqab": 805,
  "Muhtaha Full Set": 1600,
  "Muntaha Hijab Niqab": 825,
};

const scriptURL =
  "https://script.google.com/macros/s/AKfycbxLXPA-uwqyk1etTlETuAIrpjc8tzDLyWvqU94D1tDJ5CM_QuKw1eJ5aSmMS0AIVNIUSQ/exec";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(scriptURL);
      const json = await res.json();
      if (json.data) {
        setEntries(json.data);
      } else {
        setEntries([]);
      }
    } catch (err) {
      setError("Failed to load data. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    const price = selectedProduct ? productList[selectedProduct] : 0;
    setTotal(quantity && price ? Number(quantity) * price : 0);
  }, [selectedProduct, quantity]);

  const addEntry = async () => {
    if (!selectedProduct || !quantity || !date) {
      alert("Please fill in all fields.");
      return;
    }
    const price = productList[selectedProduct];
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      const now = new Date();
      const fullDateTime = `${date} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      formData.append("date", fullDateTime);
      formData.append("product", selectedProduct);
      formData.append("quantity", quantity);
      formData.append("price", price);
      formData.append("total", total);
      const res = await fetch(scriptURL, { method: "POST", body: formData });
      const json = await res.json();
      if (json.status === "success") {
        await fetchEntries();
        setSelectedProduct("");
        setQuantity("");
        setDate("");
        setTotal(0);
      } else {
        setError("Failed to save data. Please try again.");
      }
    } catch (err) {
      setError("Error saving data. Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getFilteredEntries = () => {
    let filtered = [...entries];
    if (showCustomDate && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      filtered = filtered.filter((e) => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    }
    return filtered.sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return sortOrder === "asc" ? da - db : db - da;
    });
  };

  const filteredEntries = getFilteredEntries();

  // Calculate sum total for all entries in the filtered list
  const grandTotal = filteredEntries.reduce(
    (acc, entry) => acc + Number(entry.total),
    0
  );

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      timeZone: "Asia/Dhaka",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getDateColor = (() => {
    const dateMap = new Map();
    const colors = [
      "#FFF7E6",
      "#E6F7FF",
      "#F6FFED",
      "#FFF0F6",
      "#F9F0FF",
      "#FFF2E8",
    ];
    let index = 0;
    return (dateStr) => {
      const day = new Date(dateStr).toLocaleDateString();
      if (!dateMap.has(day)) {
        dateMap.set(day, colors[index % colors.length]);
        index++;
      }
      return dateMap.get(day);
    };
  })();

  const handleLogin = () => {
    if (password === "afnan123") {
      setAuthenticated(true);
    } else {
      toast.error("❌ Incorrect password!");
    }
  };

  if (!authenticated) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
        <Toaster position="top-center" />
        <h2 className="text-xl mb-4">🔒 Enter Password to Continue</h2>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          className="p-2 border rounded mb-2 shadow-sm focus:ring focus:ring-indigo-300"
        />
        <button
          onClick={handleLogin}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded cursor-pointer"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Toaster position="top-center" />
      {/* ব্রান্ড নাম সবসময় দেখাবে */}
      <h1 className="text-2xl font-bold mb-4 text-center text-indigo-700 print:mb-10 print:text-3xl print:font-extrabold">
        🛍️ Afnan Fashion
      </h1>

      {/* নিচে UI print এ লুকাবে */}
      <div className="mb-4 flex gap-2 flex-wrap justify-center print:hidden">
        <button
          onClick={() => setShowCustomDate((prev) => !prev)}
          className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-yellow-600 transition"
        >
          📅 Custom Date
        </button>
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-green-700 transition"
        >
          🖨️ Print
        </button>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-600 transition"
        >
          🔄 Sort: {sortOrder === "asc" ? "Oldest First" : "Newest First"}
        </button>
      </div>

      {showCustomDate && (
        <div className="grid grid-cols-2 gap-2 mb-4 print:hidden">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
      )}

      {/* ফর্ম ইনপুট print এ লুকাবে */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 print:hidden">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="p-2 border rounded cursor-pointer"
        >
          <option value="">Select Product</option>
          {Object.keys(productList).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          min="1"
          className="p-2 border rounded"
        />

        <input
          value={`৳ ${total}`}
          readOnly
          className="p-2 border rounded bg-gray-100"
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded cursor-pointer"
        />
      </div>

      <button
        onClick={addEntry}
        className={`bg-indigo-600 text-white px-6 py-3 rounded w-full mb-10
          shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 active:scale-95
          ${loading ? "cursor-not-allowed opacity-70" : "cursor-pointer"} print:hidden`}
        disabled={loading}
      >
        {loading ? (
          <div className="flex justify-center items-center gap-2">
            <div
              className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"
              aria-label="loading spinner"
            ></div>
            <span>Submitting...</span>
          </div>
        ) : (
          "✅ Add Entry"
        )}
      </button>

      <table className="w-full border text-sm">
        <thead className="bg-indigo-100">
          <tr>
            <th className="border p-2">Date & Time</th>
            <th className="border p-2">Product</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry) => (
            <tr
              key={entry.date + entry.product}
              style={{ backgroundColor: getDateColor(entry.date) }}
            >
              <td className="border p-2">{formatDateTime(entry.date)}</td>
              <td className="border p-2">{entry.product}</td>
              <td className="border p-2">{entry.quantity}</td>
              <td className="border p-2">৳{entry.price}</td>
              <td className="border p-2 font-semibold">৳{entry.total}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-indigo-200 font-bold">
            <td colSpan="4" className="border p-2 text-right">
              Total:
            </td>
            <td className="border p-2">৳{grandTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
