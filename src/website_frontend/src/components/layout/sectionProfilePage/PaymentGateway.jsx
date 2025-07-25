import React from "react";
import { useEffect, useState } from 'react';
import { useAuth } from "../../../provider/authProvider";
// import { AccountIdentifier } from "@dfinity/ledger-icp";

const PaymentGateway = () => {
  const { isLoggedIn, principalId, actor } = useAuth();
  const [trx, setTrx] = useState([]);

  async function loadTrx() {
    try {
      const fetchedTrx = await actor.get_transaction();
      console.log("fetched:", fetchedTrx);

      const ResultTrx = fetchedTrx.map((trx) => {
        return JSON.parse(trx)
      });

      setTrx(ResultTrx);
      console.log("setTrx :>>", ResultTrx);
    } catch (error) {
      console.error("Error loading Trx:", error);
    }
  }

  function numberArrayToHexString(numbers) {
    return numbers.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  useEffect(() => {
    if (isLoggedIn && principalId && actor) {
      loadTrx();
    }
  }, [actor, isLoggedIn, principalId]);

  return (
    <div className="m-4 min-w-fit rounded-lg bg-slate-100 p-5">
      <p className="pb-2 pl-1 text-lg font-semibold">
        Transaction History
      </p>

      <div className="grid gap-4 overflow-y-auto py-5 md:px-8">
        {trx.map((trx, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between gap-2 rounded-md bg-white p-4 shadow-sm transition-all duration-150 hover:border-gray-300 md:flex-row md:items-center md:gap-10"
          >
            {/* KIRI: To & Amount */}
            <div>
              <p className="text-sm text-gray-700">
                <strong>To:</strong> {numberArrayToHexString(trx.to)}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Amount:</strong> {trx.amount.e8s / 100_000_000} ICP
              </p>
            </div>

            {/* KANAN: Memo & Timestamp */}
            <div className="text-right">
              <p className="text-sm text-gray-700">
                {trx.message}
              </p>
              <p className="text-sm text-gray-700">
                {new Date(Number(trx.timestamp.timestamp_nanos / 1_000_000)).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

  );

};

export default PaymentGateway;
