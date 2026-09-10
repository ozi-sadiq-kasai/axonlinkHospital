import { useCallback, useEffect, useState } from "react";
import { hospitalApi } from "../../hospitalApi";

export function useFacilityPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await hospitalApi.listPatients();
      setPatients(Array.isArray(result?.patients) ? result.patients : []);
    } catch (reason) {
      setPatients([]);
      setError(reason?.message || "Unable to load patients.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    hospitalApi.listPatients()
      .then((result) => { if (active) setPatients(Array.isArray(result?.patients) ? result.patients : []); })
      .catch((reason) => { if (active) { setPatients([]); setError(reason?.message || "Unable to load patients."); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { patients, loading, error, reload: load };
}
