import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  collection,
  addDoc
} from "firebase/firestore";

const STATUS_OPTIONS = ["Planned", "Recorded", "Active", "Completed"];

function generateCampaignId() {
  const now = new Date();
  const pad = n => n.toString().padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `C${stamp}${random}`;
}

function CampaignForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    clientName: "",
    campaignName: "",
    manager: "",
    status: "Planned"
  });

  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const loadData = async () => {
        const docRef = doc(db, "campaigns", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setFormData(snapshot.data());
        } else {
          alert("Campaign not found");
          navigate("/campaigns");
        }
        setLoading(false);
      };
      loadData();
    }
  }, [id, isEdit, navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.clientName || !formData.campaignName) {
      alert("Client and Campaign name are required.");
      return;
    }

    try {
      if (isEdit) {
        await updateDoc(doc(db, "campaigns", id), {
          ...formData,
          updatedAt: Timestamp.now()
        });
      } else {
        const newId = generateCampaignId();
        await setDoc(doc(db, "campaigns", newId), {
          ...formData,
          campaignId: newId,
          createdAt: Timestamp.now()
        });
      }
      navigate("/campaigns");
    } catch (err) {
      console.error("Error saving campaign:", err);
      alert("Error saving campaign.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>{isEdit ? "Edit Campaign" : "Add New Campaign"}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Client Name:<br />
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
          />
        </label>
        <br /><br />
        <label>
          Campaign Name:<br />
          <input
            type="text"
            name="campaignName"
            value={formData.campaignName}
            onChange={handleChange}
          />
        </label>
        <br /><br />
        <label>
          Manager:<br />
          <input
            type="text"
            name="manager"
            value={formData.manager}
            onChange={handleChange}
          />
        </label>
        <br /><br />
        <label>
          Status:<br />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <br /><br />
        <button type="submit">{isEdit ? "Update" : "Create"}</button>{" "}
        <button type="button" onClick={() => navigate("/campaigns")}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default CampaignForm;
