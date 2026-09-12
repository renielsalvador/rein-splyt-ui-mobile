# Legacy — read-only

This directory is no longer the source of truth. The canonical Supabase backend
lives in the sibling **`splyt-api`** repository, which owns the schema, RLS
policies, RPCs, Storage policies, Auth email templates, seed fixtures, and the
generated database types.

Do not add, edit, or apply anything here. These files are retained only as the
extraction source until the mandatory production reconciliation described in
`splyt-api/docs/production-reconciliation.md` has been signed off. They will be
removed after that gate passes.

All backend changes go through `splyt-api` migrations and its guarded
deployment workflows.
