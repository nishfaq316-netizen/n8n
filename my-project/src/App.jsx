import { useState } from "react";

const itemPriceList = {
  "Furnace Inspection": 120,
  "Thermostat Installation": 150,
  "Air Duct Cleaning": 80,
  "AC Repair": 200,
  "Filter Replacement": 50,
  "Boiler Check": 100,
  "Water Heater Repair": 180,
  "Vent Cleaning": 90,
  "Pipe Leak Fix": 110,
  "Electrical Panel Upgrade": 250,
};

export default function App() {
  const [proposalId, setProposalId] = useState("");
  const [customer, setCustomer] = useState({
    first_name: "",
    last_name: "",
    company: "",
    email: "",
  });

  const [serviceDetails, setServiceDetails] = useState({
    service_type: "",
    requested_date: "",
  });

  const [travelFee, setTravelFee] = useState({ zone: "Zone 1" });
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState([]);
  const [jsonOutput, setJsonOutput] = useState("");

  const N8N_WEBHOOK_URL =
    "https://auto.robogrowthpartners.com/webhook/proposal-form";

  const generateProposalID = () => {
    const date = new Date();
    const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(Math.random() * 900 + 100);
    return `PROP-${ymd}-${rand}`;
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        item: lineItems.length + 1,
        description: "",
        quantity: 1,
        unit_cost: 0,
      },
    ]);
  };

  const removeLineItem = (i) => {
    const updated = lineItems.filter((_, index) => index !== i);
    updated.forEach((item, index) => (item.item = index + 1));
    setLineItems(updated);
  };

  const updateLineItem = (index, field, value) => {
    const updated = [...lineItems];
    updated[index][field] =
      field === "quantity" || field === "unit_cost"
        ? Number(value)
        : value;

    if (field === "description") {
      updated[index].unit_cost = itemPriceList[value] || 0;
    }

    setLineItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalId = proposalId || generateProposalID();
    setProposalId(finalId);

    const payload = {
      proposal_id: finalId,
      customer,
      service_details: serviceDetails,
      travel_fee: travelFee,
      notes,
      line_items: lineItems,
    };

    setJsonOutput(JSON.stringify(payload, null, 4));

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resultText = await res.text();
      console.log("Webhook response:", resultText);

      if (res.ok) {
        alert("Proposal submitted successfully!");
      } else {
        alert("Webhook rejected the data. Check console for details.");
      }
    } catch (err) {
      alert("Server connection error. Check console.");
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Proposal Form</h1>

      <form
        className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow"
        onSubmit={handleSubmit}
      >
        {/* Proposal ID */}
        <div className="mb-6">
          <label className="block font-medium">Proposal ID</label>
          <input
            type="text"
            value={proposalId}
            readOnly
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Customer Information */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2 border-b pb-1">
            Customer Information
          </h2>

          {["first_name", "last_name", "company", "email"].map((field) => (
            <div key={field} className="mb-3">
              <label className="block capitalize">
                {field.replace("_", " ")}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                className="w-full p-2 border rounded"
                value={customer[field]}
                onChange={(e) =>
                  setCustomer({ ...customer, [field]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        {/* Line Items */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2 border-b pb-1">
            Line Items
          </h2>

          <table className="w-full border-collapse mb-3">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">#</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Unit Cost</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2 text-center">{item.item}</td>
                  <td className="border p-2">
                    <select
                      className="w-full p-2 border rounded"
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(index, "description", e.target.value)
                      }
                    >
                      <option value="">Select Item</option>
                      {Object.keys(itemPriceList).map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="1"
                      className="w-full p-2 border rounded"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(index, "quantity", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      className="w-full p-2 border rounded"
                      value={item.unit_cost}
                      onChange={(e) =>
                        updateLineItem(index, "unit_cost", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      type="button"
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => removeLineItem(index)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={addLineItem}
          >
            + Add Line Item
          </button>
        </div>

        {/* Service Details */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2 border-b pb-1">
            Service Details
          </h2>

          <label className="block mb-1">Service Type</label>
          <select
            className="w-full p-2 border rounded"
            value={serviceDetails.service_type}
            onChange={(e) =>
              setServiceDetails({
                ...serviceDetails,
                service_type: e.target.value,
              })
            }
          >
            <option value="">Select Service Type</option>
            <option value="HVAC Repair">HVAC Repair</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="General Maintenance">General Maintenance</option>
          </select>

          <label className="block mt-3 mb-1">Requested Date</label>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={serviceDetails.requested_date}
            onChange={(e) =>
              setServiceDetails({
                ...serviceDetails,
                requested_date: e.target.value,
              })
            }
          />
        </div>

        {/* Travel Zone */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2 border-b pb-1">
            Travel Zone
          </h2>

          <select
            className="w-full p-2 border rounded"
            value={travelFee.zone}
            onChange={(e) => setTravelFee({ zone: e.target.value })}
          >
            {["Zone 1", "Zone 2", "Zone 3", "Zone 4"].map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2 border-b pb-1">Notes</h2>
          <textarea
            rows="4"
            className="w-full p-2 border rounded"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Submit Proposal
        </button>
      </form>

      {/* JSON Output */}
      {jsonOutput && (
        <pre className="max-w-4xl mx-auto mt-6 p-4 bg-gray-900 text-green-400 rounded text-sm overflow-auto">
          {jsonOutput}
        </pre>
      )}
    </div>
  );
}
