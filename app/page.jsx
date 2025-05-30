"use client";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

const productList = {
  "সাবিহা ফুল সেট": 1600,
  "সাবিহা হিজাব নিকাব": 805,
  "মুহতাহা ফুল সেট": 1600,
  "মুনতাহা হিজাব নিকাব": 825,
};

const scriptURL = "https://script.google.com/macros/s/AKfycbxLXPA-uwqyk1etTlETuAIrpjc8tzDLyWvqU94D1tDJ5CM_QuKw1eJ5aSmMS0AIVNIUSQ/exec";

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

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(scriptURL);
      const json = await res.json();
      if (json.data) {
        setEntries(json.data.reverse());
      } else {
        setEntries([]);
      }
    } catch (err) {
      setError("ডাটা লোড করতে সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন।");
      console.error(err);
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
      alert("সব তথ্য পূরণ করুন");
      return;
    }

    const price = productList[selectedProduct];
    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      const now = new Date();
      const fullDateTime = `${date} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

      formData.append("date", fullDateTime);
      formData.append("product", selectedProduct);
      formData.append("quantity", quantity);
      formData.append("price", price);
      formData.append("total", total);

      const res = await fetch(scriptURL, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (json.status === "success") {
        await fetchEntries();
        setSelectedProduct("");
        setQuantity("");
        setDate("");
        setTotal(0);
      } else {
        setError("ডাটা সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch (err) {
      setError("ডাটা সংরক্ষণে সমস্যা হয়েছে। ইন্টারনেট চেক করুন।");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = (data) => {
    return data.reduce((sum, item) => sum + Number(item.total), 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const getFilteredEntries = () => {
    if (showCustomDate && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      return entries.filter((e) => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    }
    return entries;
  };

  const filteredEntries = getFilteredEntries();

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("bn-BD", {
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

  const handleLogin = () => {
    if (password === "afnan123") {
      setAuthenticated(true);
    } else {
      toast.error("❌ ভুল পাসওয়ার্ড দিয়েছেন!");
    }
  };

  if (!authenticated) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
        <Toaster position="top-center" />
        <h2 className="text-xl mb-4">🔒 প্রবেশের জন্য পাসওয়ার্ড দিন</h2>
        <input
          type="password"
          placeholder="পাসওয়ার্ড"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLogin();
          }}
          className="p-2 border rounded mb-2 shadow-sm focus:ring focus:ring-indigo-300"
        />
        <button
          onClick={handleLogin}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-all duration-200"
        >
          লগইন
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 print:p-0 print:bg-white">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg border print:border-none print:shadow-none">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <h1 className="text-2xl font-bold text-indigo-700 print:text-black">🛍️ আফনান ফ্যাশন</h1>
          <div className="flex items-center gap-2 print:hidden flex-wrap justify-center">
            <button
              onClick={() => setShowCustomDate((prev) => !prev)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded-md transition-transform duration-200 hover:scale-105"
            >
              📅 কাস্টম তারিখ
            </button>
            <button
              onClick={handlePrint}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-4 rounded transition-transform duration-200 hover:scale-105"
              disabled={loading}
            >
              🖨️ প্রিন্ট করুন
            </button>
          </div>
        </div>

        {showCustomDate && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 print:hidden transition-all duration-300">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="p-2 border rounded-md focus:ring focus:ring-yellow-300"
            />
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="p-2 border rounded-md focus:ring focus:ring-yellow-300"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
          <select
            className="p-3 border rounded-lg focus:ring focus:ring-indigo-300"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            disabled={loading}
          >
            <option value="">মাল সিলেক্ট করুন</option>
            {Object.keys(productList).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            className="p-3 border rounded-lg focus:ring focus:ring-indigo-300"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="পরিমাণ"
            disabled={loading}
            min="1"
          />

          <input
            className="p-3 border rounded-lg bg-gray-100"
            value={`৳ ${total}`}
            readOnly
          />

          <input
            className="p-3 border rounded-lg focus:ring focus:ring-indigo-300"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="mt-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <div className="flex justify-center mt-4 print:hidden">
  <button
    className={`relative bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
    onClick={addEntry}
    disabled={loading}
  >
    {loading ? (
      <>
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
          ></path>
        </svg>
        সেভ হচ্ছে...
      </>
    ) : (
      "✅ যোগ করুন"
    )}
  </button>
</div>


        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3 border-b pb-2 print:border-black print:text-black text-indigo-600">
            📋 হিসাব তালিকা
          </h2>
          {loading && entries.length === 0 ? (
            <p className="text-gray-500 text-center">লোড হচ্ছে...</p>
          ) : filteredEntries.length === 0 ? (
            <p className="text-gray-500 text-center">তালিকায় কোন তথ্য নেই</p>
          ) : (
            <table className="w-full text-sm border border-gray-300 print:text-xs">
              <thead className="bg-indigo-200 print:bg-gray-100">
                <tr>
                  <th className="border p-2">তারিখ ও সময়</th>
                  <th className="border p-2">মাল</th>
                  <th className="border p-2">পরিমাণ</th>
                  <th className="border p-2">দাম</th>
                  <th className="border p-2">মোট</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id + entry.date + entry.product}
                    className="even:bg-indigo-50 print:even:bg-white"
                  >
                    <td className="border p-2">{formatDateTime(entry.date)}</td>
                    <td className="border p-2">{entry.product}</td>
                    <td className="border p-2">{entry.quantity}</td>
                    <td className="border p-2">৳{entry.price}</td>
                    <td className="border p-2 font-semibold">৳{entry.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredEntries.length > 0 && (
          <div className="mt-6 text-right font-bold text-lg text-indigo-700 print:text-black">
            মোট টাকার পরিমাণ:{" "}
            <span className="text-red-600">৳{getTotalAmount(filteredEntries)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
