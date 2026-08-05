import { useEffect, useState } from 'react';
import { reiProjectsGcpAdapter } from '@/api/adapters/rei-projects-gcp';

interface SidebarBadges {
  pipeline: number;
  projects: number;
}

export function useSidebarBadges(): SidebarBadges {
  const [badges, setBadges] = useState<SidebarBadges>({ pipeline: 0, projects: 0 });

  useEffect(() => {
    let stale = false;

    const fetchCounts = async () => {
      try {
        const projects = await reiProjectsGcpAdapter.getAll();
        if (stale) return;

        // NOTE: The original Supabase hook queried rei_projects by
        // pipeline_stage (a field that lives in `opportunities`, not
        // `rei_projects`). The query was semantically broken; we now
        // count client-side from the GCP data.
        const active = projects.filter(p => p.status === 'active').length;
        setBadges({
          pipeline: 0, // pipeline_stage lives in opportunities, no cross-table count available
          projects: active,
        });
      } catch (err) {
        console.error('[useSidebarBadges] fetch error:', err);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000);
    return () => { stale = true; clearInterval(interval); };
  }, []);

  return badges;
}
