// 📄 CampaignDetail.js — Read-only Campaign View
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";
import { calculateTotalSlots } from "./utils";

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [clientName, setClientName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [chains, setChains] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const ref = doc(db, "campaigns", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const data = snap.data();
      setCampaign(data);

      const [clientSnap, managerSnap, chainSnap] = await Promise.all([
        getDoc(doc(db, "clients", data.clientId)),
        getDoc(doc(db, "managers", data.managerId)),
        getDocs(collection(db, "chains"))
      ]);

      if (clientSnap.exists()) setClientName(clientSnap.data().name);
      if (managerSnap.exists()) {
        const d = managerSnap.data();
        setManagerName(`${d.name} ${d.lastName || ""}`);
      }

      const chainMap = {};
      chainSnap.forEach(doc => {
        chainMap[doc.id] = doc.data().chainName;
      });
      setChains(chainMap);
    };

    loadData();
  }, [id]);

  if (!campaign) return <p>Loading...</p>;

  const created =
    campaign.createdAt?.toDate
      ? campaign.createdAt.toDate().toLocaleDateString()
      : campaign.createdAt
        ? new Date(campaign.createdAt).toLocaleDateString()
        : "";

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <h2>📛 {campaign.campaignName}</h2>
      <p><b>Campaign ID:</b> {id}</p>
      <p><b>Client:</b> {clientName}</p>
      <p><b>Manager:</b> {managerName}</p>
      <p><b>Status:</b> {campaign.status}</p>
      <p><b>Created:</b> {created}</p>
      <p><b>Total Budget:</b> {(campaign.budget || 0).toLocaleString()} AMD</p>

      <hr />
      <h3>📦 Chains</h3>
      <ul>
        {campaign.chains.map((c, i) => {
          const totalSlots = calculateTotalSlots(c.startDate, c.endDate, c.slotSchedule);

          const budget = totalSlots * c.slotPrice * c.locationCount;

          return (
            <li key={i} style={{ opacity: c.disabled ? 0.5 : 1 }}>
              <b>{chains[c.chainId] || c.chainId}</b> ({c.startDate} – {c.endDate})<br />
              {totalSlots} slots × {c.locationCount} loc × {c.slotPrice} AMD = <b>{budget.toLocaleString()} AMD</b><br />
              {c.disabled && <i>(Disabled)</i>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
