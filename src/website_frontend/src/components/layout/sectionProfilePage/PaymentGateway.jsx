import React from "react";
import { useState } from 'react';
import Button from "../../ui/Button";
import { FaPlus } from "react-icons/fa";
import { useAuth } from "../../../hooks/authHook"; // Assuming you have this hook

const PaymentGateway = () => {
  const { TopupCredit } = useAuth();
  const [credit, setCredit] = useState(0);
  const [icpAmount, setIcpAmount] = useState(0);
  const [icpInE8s, setIcpInE8s] = useState(0);

  const ICP_PRICE_USD = 8.75; // ini bisa kamu update real-time kalau mau

  const handleChange = (e) => {
    const creditInput = parseInt(e.target.value, 10);
    setCredit(creditInput);

    const icp = creditInput / ICP_PRICE_USD;
    setIcpAmount(icp);

    // ICP → e8s
    const e8s = Math.round(icp * 1e8);
    setIcpInE8s(e8s);
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-sm">
      <label className="block mb-2 font-bold">Jumlah Kredit (1 credit = $1)</label>
      <input
        type="number"
        value={credit}
        onChange={handleChange}
        className="border p-2 w-full rounded"
        placeholder="Masukkan jumlah kredit"
        min={1}
      />

      <div className="mt-4">
        <p>Harga ICP saat ini: <strong>${ICP_PRICE_USD}</strong></p>
        <p>Perlu bayar: <strong>{icpAmount.toFixed(6)} ICP</strong></p>
        <p>Dalam e8s: <code>{icpInE8s}</code></p>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => TopupCredit(icpInE8s, "Topup Credit")}
        className="w-full bg-transparent hover:bg-gray-600 !justify-start border-none"
      >
        <FaPlus size={20} />
        <p>Topup</p>
      </Button>
    </div>
  );
  // return (
  //   <div className="bg-fontPrimaryColor m-4 min-w-fit rounded-lg p-5">
  //     <p className="pb-2 pl-1 text-lg">
  //       <strong>Payment Gateway</strong>
  //     </p>
  //     <div className="grid border-separate grid-flow-row border p-2">
  //       <div className="border-borderShade flex flex-col gap-y-2 rounded-md border border-opacity-20 p-2 text-sm md:text-base">
  //         <p className="col-start-1">
  //           <strong>Status Account</strong>
  //         </p>
  //         <p className="">Free</p>
  //       </div>
  //       <p className="py-10">
  //         <strong>Wanna Upgrade?</strong>
  //       </p>
  //       <div className="h-auto w-full gap-x-2">
  //         <div className="relative mb-4 flex w-full flex-col justify-between space-y-2 overflow-hidden rounded-xl bg-[#5E17F4] p-4 text-sm text-white md:w-1/3">
  //           <span className="text-fontPrimaryColor text-xs uppercase">
  //             Basic
  //           </span>
  //           <span className="text-fontPrimaryColor absolute right-0 top-0 pr-6 text-lg">
  //             Rp. 39.900
  //           </span>
  //           <div className="flex flex-row items-center space-x-3 pt-4">
  //             <span className="text-base font-medium">
  //               Get Balance up to 200.
  //             </span>
  //           </div>
  //           <button className="flex items-center justify-center space-x-1 rounded-full bg-white px-4 py-2 text-xs font-medium text-black">
  //             <span>Next step</span>
  //             <svg
  //               xmlns="http://www.w3.org/2000/svg"
  //               width="20"
  //               height="20"
  //               viewBox="0 0 24 24"
  //               fill="none"
  //               stroke="#000000"
  //               strokeWidth="2"
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //             >
  //               <path d="M5 12h13M12 5l7 7-7 7" />
  //             </svg>
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default PaymentGateway;
