import { supabase } from "@/lib/supabase";
import { getSignedUrl } from "@/utils/storage";
import { useEffect, useState, useCallback } from "react";

export interface JobFile {
  id: string;
  job_id: string;
  uploader_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  is_submission: boolean;
  is_watermarked: boolean;
  created_at: string;
  downloadUrl?: string;
}

/**
 * Fetches job files for a job. Only returns files if the current user is
 * a poster or accepted worker (isAuthorized=true).
 * For submission files (is_submission=true) the downloadUrl is only populated
 * once the job status is 'completed' so the link stays disabled otherwise.
 */
export const useJobFiles = (jobId: string, isAuthorized: boolean, jobStatus?: string) => {
  const [files, setFiles] = useState<JobFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    if (!jobId) {
      setFiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("job_files")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const withUrls: JobFile[] = await Promise.all(
        (data as JobFile[]).map(async (f) => {
          // Submission files: only generate signed URL if job is completed
          if (f.is_submission && jobStatus !== "completed") {
            return { ...f, downloadUrl: undefined };
          }
          
          if (!f.is_submission) {
            // For brief files, try to get a signed URL, fallback to public URL
            try {
              const downloadUrl = await getSignedUrl("job-files", f.file_url);
              return { ...f, downloadUrl };
            } catch {
              const { data: publicData } = supabase.storage.from("job-files").getPublicUrl(f.file_url);
              return { ...f, downloadUrl: publicData.publicUrl };
            }
          }

          // For submission files that are completed
          try {
            const downloadUrl = await getSignedUrl("job-files", f.file_url);
            return { ...f, downloadUrl };
          } catch {
            return { ...f, downloadUrl: undefined };
          }
        })
      );

      setFiles(withUrls);
    } catch (err) {
      console.error("useJobFiles error:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [jobId, jobStatus]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, loading, refresh: fetchFiles };
};
